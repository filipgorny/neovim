import R from 'ramda'
import removeUnwantedRawText from '../../../services/book-content/remove-unwanted-raw-text'
import { throwException } from '../../../utils/error/error-factory'
import { create, findOneOrFail, update, remove, fixBookContentOrderAfterDeleting, findOneInstanceOrFail, deleteAllBookContentsFromSubchapter, deleteRecordCompletely, findOneOrFailWithDeleted, restoreAllBookContentsFromSubchapter, restore } from './book-content-repository'
import { BookContentType } from './book-content-types'
import { makeDTO } from './dto/book-content-dto'
import db from '../../models'
import { createBookContentResource, createBookContentResourcesFromOriginal, removeResourceInTrx, removeVideosByBookContentId } from '../book-content-resources/book-content-resource-service'
import mapP from '../../../utils/function/mapp'
import { BookContentResourceTypeEnum } from '../book-content-resources/book-contennt-resource-types'
import { fetchResourceCountFromBookContent, patch as patchResource } from '../book-content-resources/book-content-resource-repository'
import { createBookContentQuestionsFromOriginal, removeQuestionsByBookContentId } from '../book-content-questions/book-content-questions-service'
import { patch as patchContentQuestion } from '../book-content-questions/book-content-questions-repository'
import { createBookContentImagesFromOriginal, removeImagesByBookContentId } from '../book-content-images/book-content-image-service'
import { createBookContentFlashcardsFromOriginal, removeBookContentFlahscardsByContentId } from '../book-content-flashcards/book-content-flashcard-service'
import { patchWhere as patchContentFlashcardsWhere } from '../book-content-flashcards/book-content-flashcard-repository'
import { cretateBookContentAttachmentsFromOriginal, deleteAttachmentByBookContentId } from '../book-content-attachments/book-content-attachment-service'
import { findOneOrFail as findFlashcard, getMaxCode, patch as patchFlashcard, deleteCompletely as deleteFlashcardCompletely, unarchiveFlashcard, archiveFlashcard } from '../flashcards/flashcard-repository'
import concatPath from '../../../utils/function/concatpath'
import { archiveVideo, deleteCompletely as deleteVideoCompletely, unarchiveVideo } from '../videos/video-repository'
import { archiveQuestion, deleteCompletely as deleteQuestionCompletely, unarchiveQuestion } from '../questions/question-repository'
import { findByContentId as findContentTopicsByContentId, create as createContentTopic } from '../book-content-course-topics/book-content-course-topics-repository'
import { deleteByBookContentId as deleteContentTopicByBookContentId } from '../book-content-course-topics/book-content-course-topics-service'
import { copyAndArchiveFlashcardById } from '../flashcards/flashcard-service'
import { copyAndArchiveVideoById } from '../videos/video-service'
import { copyAndArchiveQuestionById } from '../questions/question-service'
import { deleteByBookContentId as deleteContentCommentsByBookContentId } from '../book-content-comments/book-content-comments-service'

export const createBookContent = async (type: BookContentType, order: number, raw: string, delta_object: object, subchapter_id: string, content_html?: string) => (
  create(
    makeDTO(type, order, removeUnwantedRawText(raw), JSON.stringify(delta_object), subchapter_id, content_html)
  )
)

export const updateBookContent = (id: string) => async (dto: { raw: string, delta_object: object, content_html?: string }) => (
  update(id, {
    ...dto,
    ...dto.raw && {
      raw: removeUnwantedRawText(dto.raw),
    },
  })
)

export const patchBookContent = (id: string) => async (dto) => (
  update(id, dto)
)

export const deleteBookContent = (was_manually_deleted: boolean = true, parent_was_manually_deleted: boolean = false) => async (id: string) => {
  if (was_manually_deleted) {
    const content = await findOneOrFail({ id })

    await Promise.all([
      removeBookContentFlahscardsByContentId(id),
      removeQuestionsByBookContentId(id),
      removeVideosByBookContentId(id),
      removeImagesByBookContentId(id),
      deleteAttachmentByBookContentId(id),
      deleteContentTopicByBookContentId(id),
      deleteContentCommentsByBookContentId(id),
    ])

    if (!parent_was_manually_deleted) {
      await fixBookContentOrderAfterDeleting(content.subchapter_id, content.order)
    }
  } else {
    const content = await findOneOrFail({ id }, ['contentFlashcards.flashcard', 'videoResources.video', 'questions.question'])

    await mapP(
      async (contentFlashcard) => archiveFlashcard(contentFlashcard.flashcard.id)
    )(content.contentFlashcards)

    await mapP(
      async (resource) => archiveVideo(resource.video.id)
    )(content.videoResources)

    await mapP(
      async (contentQuestion) => archiveQuestion(contentQuestion.question.id)
    )(content.questions)
  }

  return remove(id, was_manually_deleted)
}

export const restoreBookContent = async (id: string) => {
  const content = await findOneOrFailWithDeleted({ id }, ['contentFlashcards.flashcard', 'videoResources.video', 'questions.question'])

  const flashcardIds = concatPath(['contentFlashcards'], ['flashcard', 'id'])(content)
  const videoIds = concatPath(['videoResources'], ['video', 'id'])(content)
  const questionIds = concatPath(['questions'], ['question', 'id'])(content)

  await mapP(
    unarchiveFlashcard
  )(flashcardIds)

  await mapP(
    unarchiveVideo
  )(videoIds)

  await mapP(
    unarchiveQuestion
  )(questionIds)

  return restore(id)
}

export const deleteBySubchapterId = (was_manually_deleted: boolean = false) => async (subchapter_id: string) => (
  deleteAllBookContentsFromSubchapter(was_manually_deleted)(subchapter_id)
)

export const restoreBySubchapterId = async (subchapter_id: string) => (
  restoreAllBookContentsFromSubchapter(subchapter_id)
)

const removeInBatches = async (ids, removeFunc, recordsPerBatch) => {
  for (let i = 0; i < ids.length; i += recordsPerBatch) {
    await mapP(
      removeFunc
    )(R.slice(i, i + recordsPerBatch, ids))
  }
}

const getIdIfArchived = R.ifElse(
  R.propEq('is_archived', true),
  R.prop('id'),
  R.always(null)
)

export const ignoreNull = f => async (val) => {
  if (val !== null && val !== undefined) return f(val)
}

export const removeBookContentCompletely = async (id: string) => {
  console.log('deleting book content completely', id)

  const RECORDS_PER_BATCH = 100

  const content = await findOneOrFailWithDeleted({ id }, ['archivedFlashcards', 'videoResources.video', 'questions.question'])

  const flahscardsIds = concatPath(['archivedFlashcards'], ['id'])(content)
  const videoIds = concatPath(['videoResources'], ['video'], getIdIfArchived)(content)
  const questionIds = concatPath(['questions'], ['question'], getIdIfArchived)(content)

  await Promise.all([
    removeBookContentFlahscardsByContentId(id),
    removeQuestionsByBookContentId(id),
    removeVideosByBookContentId(id),
    removeImagesByBookContentId(id),
    deleteAttachmentByBookContentId(id),
    deleteContentTopicByBookContentId(id),
    deleteContentCommentsByBookContentId(id),
  ])

  await removeInBatches(flahscardsIds, deleteFlashcardCompletely, RECORDS_PER_BATCH)
  await removeInBatches(videoIds, ignoreNull(deleteVideoCompletely), RECORDS_PER_BATCH)
  await removeInBatches(questionIds, ignoreNull(deleteQuestionCompletely), RECORDS_PER_BATCH)

  await deleteRecordCompletely(id)
}

const detachFlashcards = async (id: string) => {
  const content = await findOneInstanceOrFail({ id }, ['flashcards'])

  await content.flashcards().detach()
}

export const attachFlashcards = async (id: string, flashcardIds: string[]) => {
  const content = await findOneInstanceOrFail({ id }, ['flashcards'])
  const detachIds = R.pipe(
    R.invoker(0, 'toJSON'),
    R.prop('flashcards'),
    R.pluck('id'),
    R.reject(
      R.includes(R.__, flashcardIds)
    )
  )(content)

  await content.flashcards().detach(detachIds)
  await content.flashcards().attach(flashcardIds)
    .catch(err => err.message.match(/duplicate key value violates unique constraint/) ? true : throwException(err))

  let maxCode = await getMaxCode()

  for (const id of flashcardIds) {
    const flashcard = await findFlashcard({ id })
    const codeIsNull = R.pipe(
      R.prop('code'),
      R.isNil
    )(flashcard)
    if (codeIsNull) {
      await patchFlashcard(id, { code: maxCode + 1 })
      maxCode += 1
    }
  }

  return true
}

export const attachVideos = async (id: string, videoIds: string[]) => {
  const content = await findOneOrFail({ id }, ['videoResources'])

  const detachRes = R.pipe(
    R.prop('videoResources'),
    R.reject(
      R.pipe(
        R.prop('external_id'),
        R.includes(R.__, videoIds)
      )
    )
  )(content)

  const newIds = R.reject(
    R.includes(R.__, R.pipe(
      R.prop('videoResources'),
      R.pluck('external_id')
    )(content))
  )(videoIds)

  await db.bookshelf.transaction(async trx => {
    await mapP(
      async resource => (
        removeResourceInTrx(resource, trx)
      )
    )(detachRes)

    const lastOrder = await fetchResourceCountFromBookContent(content.id, trx)

    for (const [index, id] of newIds.entries()) {
      const order = index + lastOrder + 1

      await createBookContentResource(
        BookContentResourceTypeEnum.video,
        order,
        undefined,
        undefined,
        content.id,
        id,
        trx
      )
    }
  })

  return true
}

export const cretateBookContentsFromOriginalContents = (subchapterId) => async originalContent => {
  const content = await R.pipe(
    R.juxt([
      R.prop('type'),
      R.prop('order'),
      R.prop('raw'),
      R.prop('delta_object'),
      R.always(subchapterId),
    ]),
    R.apply(createBookContent)
  )(originalContent)

  const originalResources = R.prop('resources')(originalContent)
  const originalQuestions = R.prop('questions')(originalContent)
  const originalImages = R.prop('images')(originalContent)
  const originalFlashcards = R.prop('flashcards')(originalContent)
  const originalAttachments = R.prop('attachments')(originalContent)

  const newContent = await findOneOrFail({ id: content.id }, ['subchapter.chapter.book'])
  const newContentId = R.prop('id')(newContent)
  const newBookId = R.path(['subchapter', 'chapter', 'book', 'id'], newContent)

  const oldContentId = R.prop('id')(originalContent)

  const contentTopics = await findContentTopicsByContentId(oldContentId)

  const contentTopicsDtos = R.map(
    R.pipe(
      R.set(
        R.lensProp('book_content_id'),
        newContentId
      ),
      R.set(
        R.lensProp('book_id'),
        newBookId
      ),
      R.omit(['id'])
    )
  )(contentTopics)

  await mapP(
    createContentTopic
  )(contentTopicsDtos)

  await Promise.all([
    createBookContentResourcesFromOriginal(content.id, originalResources),
    createBookContentQuestionsFromOriginal(content.id, originalQuestions),
    createBookContentImagesFromOriginal(content.id, originalImages),
    createBookContentFlashcardsFromOriginal(content.id, originalFlashcards),
    cretateBookContentAttachmentsFromOriginal(content.id, originalAttachments),
  ])

  return content
}
