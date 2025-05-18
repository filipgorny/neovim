import moment from 'moment'
import R from 'ramda'
import asAsync from '../../../utils/function/as-async'
import mapP from '../../../utils/function/mapp'
import { cretateBookChaptersFromOriginalChapters } from '../student-book-chapters/student-book-chapter-service'
import { fetchExistingBooksCount, patchWhereExternalIdAndExternalCreatedAt } from '../student-books/student-book-repository'
import { createStudentBook } from '../student-books/student-book-service'
import { create, findBookForSync, update, findOneOrFail, remove, patch, deleteRecordCompletely, findOneOrFailWithDeleted, countOldArchivedOrSoftDeletedUnlockedBooks, getBookIdsOfOldArchivedOrSoftDeletedUnlockedBooks, getSoftDeletedChapterIds, restore } from './book-repository'
import BookDTO, { makeDTO } from './dto/book-dto'
import { InitialiseBookPayload } from './actions/initialise-book'
import { UploadedFile } from 'express-fileupload'
import uploadFile from '../../../services/s3/upload-file'
import { S3_PREFIX_BOOKS } from '../../../services/s3/s3-file-prefixes'
import generateStaticUrl from '../../../services/s3/generate-static-url'
import { UpdateBookPayload } from './actions/update-book'
import { validateFileMimeType } from './validation/validate-file-payload'
import { PREVIEW_STUDENT_EMAIL } from '../../constants'
import randomString from '../../../utils/string/random-string'
import { deleteChapter, deleteChapterCompletely, restoreChapter } from '../book-chapters/book-chapter-service'
import { detachByBookId } from '../course-books/course-book-service'
import { copyBook } from '../../../services/books/copy-book/copy-book'
import { removeBookAdminByBookId } from '../book-admins/book-admins-service'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { int } from '../../../utils/number/int'
import { unarchiveFlashcard } from '../flashcards/flashcard-repository'
import { unarchiveQuestion } from '../questions/question-repository'
import { unarchiveVideo } from '../videos/video-repository'
import concatPath from '../../../utils/function/concatpath'
import { DELETED_AT } from '@desmart/js-utils'
import { customException, throwException } from '../../../utils/error/error-factory'
import forEachP from '../../../utils/function/foreachp'

interface CreateBookCommand {
  payload: Omit<InitialiseBookPayload, 'firstChapterTitle'>,
  imageFile?: UploadedFile,
  chapterHeadingImageFile?: UploadedFile,
  coverImageFile?: UploadedFile,
}

const uploadImageFile = async (file: UploadedFile) => uploadFile(file.data, file.mimetype, S3_PREFIX_BOOKS, true)

const validateMimeType = ({ mimetype }: UploadedFile) => validateFileMimeType(mimetype)

const uploadFileAndReturnUrl = R.pipeWith(R.andThen)([
  asAsync(
    R.tap(validateMimeType)
  ),
  uploadImageFile,
  async (imageFileKey: string) => generateStaticUrl(imageFileKey),
])

const getFileUrl = R.ifElse(
  R.isNil,
  asAsync(R.always(null)),
  uploadFileAndReturnUrl
)

export const createBook = async ({ payload, imageFile, chapterHeadingImageFile, coverImageFile }: CreateBookCommand) => {
  const imageUrl = await getFileUrl(imageFile)
  const chapterHeadingImageUrl = await getFileUrl(chapterHeadingImageFile)
  const coverImageUrl = await getFileUrl(coverImageFile)

  return await create(
    makeDTO(payload.title, payload.tag, payload.tagColour, payload.externalId, imageUrl || payload.imageUrl, chapterHeadingImageUrl || payload.chapterHeadingImageUrl, coverImageUrl || payload.coverImageUrl, payload.isTestBundle, payload.headerAbbreviation, payload.isArchived, payload.codename)
  )
}

export const updateBook = R.curry(async (id: string, imageFile: UploadedFile | undefined, chapterHeadingImageFile: UploadedFile | undefined, coverImageFile: UploadedFile | undefined, { image, chapterHeadingImage, coverImage, ...dto }: UpdateBookPayload) => {
  const modelToUpdate: Partial<BookDTO> = dto

  if (imageFile) {
    modelToUpdate.image_url = await getFileUrl(imageFile)
  } else if ([null, 'null'].includes(image)) {
    modelToUpdate.image_url = null
  }

  if (chapterHeadingImageFile) {
    modelToUpdate.chapter_heading_image_url = await getFileUrl(chapterHeadingImageFile)
  } else if ([null, 'null'].includes(chapterHeadingImage)) {
    modelToUpdate.chapter_heading_image_url = null
  }

  if (coverImageFile) {
    modelToUpdate.cover_image_url = await getFileUrl(coverImageFile)
  } else if ([null, 'null'].includes(coverImage)) {
    modelToUpdate.cover_image_url = null
  }

  return await update(id, modelToUpdate as BookDTO)
})

const prepareBookEntity = (studentId, courseId, externalCreatedAt) => R.juxt([
  R.prop('title'),
  R.always(courseId),
  R.prop('id'),
  R.always(studentId),
  R.prop('tag'),
  R.prop('tag_colour'),
  R.prop('image_url'),
  R.prop('chapter_heading_image_url'),
  R.always(externalCreatedAt),
  R.prop('is_test_bundle'),
  R.prop('header_abbreviation'),
])

export const createFullBook = (studentId, courseId, externalCreatedAt, isFreeTrial = false) => async originalBook => {
  const originalChapters = R.prop('chapters')(originalBook)

  const book = await R.pipeWith(R.andThen)([
    asAsync(prepareBookEntity(studentId, courseId, externalCreatedAt)),
    R.apply(createStudentBook(isFreeTrial)),
  ])(originalBook)

  await mapP(
    cretateBookChaptersFromOriginalChapters(book.id)
  )(originalChapters)

  return originalBook
}

export const syncBook = (studentId: string, email: string) => async product => {
  const originalBook = await findBookForSync(product.id)
  const externalCreatedAt = moment(product.created_at).format('YYYY-MM-DD')

  // skip book not found in DB
  if (!originalBook) {
    console.log('Original book not found')

    return
  }

  // irrelevant for admin preview
  // const existingBooksCount = await fetchExistingBooksCount(externalCreatedAt, originalBook.id, studentId)

  if (email !== PREVIEW_STUDENT_EMAIL) {
    console.log('Students cannot purchase standalone books')

    return
  }

  await patchWhereExternalIdAndExternalCreatedAt(externalCreatedAt, originalBook.id, studentId)({
    deleted_at: new Date(),
  })

  return createFullBook(studentId, null, externalCreatedAt)(originalBook)
}

const getChapterIds = R.pipe(
  R.prop('chapters'),
  R.pluck('id')
)

export const deleteBook = async (id: string) => {
  const book = await findOneOrFail({ id }, ['chapters'])
  const title: string = `${book.title}-deleted-${randomString()}`
  const result = await remove(id, title)

  await detachByBookId(id)

  const chapterIds = getChapterIds(book)

  await forEachP(
    deleteChapter(false, true)
  )(chapterIds) // We treat the book differently event if it was removed manually

  return result
}

export const restoreBook = async (id: string) => {
  const book = await findOneOrFailWithDeleted({ id }, ['deletedNotManuallyChapters'])

  if (!R.prop(DELETED_AT, book)) {
    throwException(customException('books.is-not-deleted', 403, 'Book is not deleted'))
  }

  await R.pipe(
    R.prop('deletedNotManuallyChapters'),
    R.pluck('id'),
    R.map(restoreChapter)
  )(book)

  return restore(id)
}

const getAllChapterIds = R.pipe(
  R.prop('allChapters'),
  R.pluck('id')
)

export const deleteBookCompletely = async (id: string) => {
  console.log('deleting book completely', id)
  const book = await findOneOrFailWithDeleted({ id }, ['allChapters'])

  await detachByBookId(id)

  await forEachP(
    deleteChapterCompletely
  )(getAllChapterIds(book))

  await removeBookAdminByBookId(id)

  await deleteRecordCompletely(id)
}

export const deleteOldArchivedOrSoftDeletedUnlockedBooksCompletely = async () => {
  console.log('deleting old books script started')

  const BOOKS_PER_BATCH = 10
  const amountOfBooks = await R.pipeWith(R.andThen)([
    countOldArchivedOrSoftDeletedUnlockedBooks,
    R.head,
    R.prop('count'),
    int,
  ])(true)

  for (let i = 0; i < amountOfBooks; i += BOOKS_PER_BATCH) {
    const oldBookIds = await getBookIdsOfOldArchivedOrSoftDeletedUnlockedBooks(BOOKS_PER_BATCH)

    for (const { id: bookId } of oldBookIds) {
      await deleteBookCompletely(bookId)
    }
  }
}

const unarchiveInBatches = async (ids, unarchiveFunc, recordsPerBatch) => {
  for (let i = 0; i < ids.length; i += recordsPerBatch) {
    await mapP(
      unarchiveFunc
    )(R.slice(i, i + recordsPerBatch, ids))
  }
}

export const archiveBook = async (id: string, is_archived: boolean) => {
  const { is_archived: was_archived } = await findOneOrFail({ id })

  if (was_archived && !is_archived) {
    const RECORDS_PER_BATCH = 100

    const book = await findOneOrFail({ id }, [
      'chapters.subchapters.contents.flashcards',
      'chapters.subchapters.contents.questions.question',
      'chapters.subchapters.contents.videoResources.video',
    ])

    const flashcardIds = concatPath(['chapters', 'subchapters', 'contents', 'flashcards'], ['id'])(book)
    const questionIds = concatPath(['chapters', 'subchapters', 'contents', 'questions'], ['question', 'id'])(book)
    const videoIds = concatPath(['chapters', 'subchapters', 'contents', 'videoResources'], ['video', 'id'])(book)

    await unarchiveInBatches(flashcardIds, unarchiveFlashcard, RECORDS_PER_BATCH)
    await unarchiveInBatches(questionIds, unarchiveQuestion, RECORDS_PER_BATCH)
    await unarchiveInBatches(videoIds, unarchiveVideo, RECORDS_PER_BATCH)
  }

  return patch(id, {
    is_archived,
  })
}

export const lockBook = async (id: string, is_locked: string) => {
  if (is_locked === 'true') {
    await copyBook(id)
  }

  return patch(id, {
    is_locked,
  })
}

export const setFlashcardsAccessible = async (id: string, flashcards_accessible: string) => (
  patch(id, {
    flashcards_accessible: flashcards_accessible === 'true',
  })
)

export const toggleAiTutor = async (id: string) => {
  const course = await findOneOrFail({ id })

  return patch(id, { ai_tutor_enabled: !course.ai_tutor_enabled })
}
