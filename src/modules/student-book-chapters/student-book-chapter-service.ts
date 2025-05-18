import R from 'ramda'
import { randomUUID } from 'crypto'
import { create, deleteChapterById, findOneOrFail, patch } from './student-book-chapter-repository'
import { deleteRecord as deleteBookChapterImage } from '../student-book-chapter-images/student-book-chapter-images-repository'
import { makeDTO } from './dto/student-book-chapter-dto'
import asAsync from '../../../utils/function/as-async'
import mapP from '../../../utils/function/mapp'
import { cretateBookSubhaptersFromOriginalSubchapters, deleteSubchapter } from '../student-book-subchapters/student-book-subchapter-service'
import { notFoundException } from '../../../utils/error/error-factory'
import { findSubchaptersWithNotes } from '../student-book-subchapters/student-book-subchapter-repository'
import { copyChapterImagesFromOriginalChapter } from '../student-book-chapter-images/student-book-chapter-images-service'
import { deleteByChapterId as deleteActivityTimers } from '../student-book-chapter-activity-timers/student-book-chapter-activity-timers-service'
import { deleteRecord as deleteChapterActivityTimer } from '../student-book-chapter-activity-timers/student-book-chapter-activity-timers-repository'
import forEachP from '../../../utils/function/foreachp'

interface FetchChapterNotesCommand {
  studentId: string;
  chapterId: string;
}

export const createBookChapter = async (title: string, book_id: string, order: number, original_chapter_id: string, image_tab_title: string) => (
  create(
    makeDTO(title, book_id, order, original_chapter_id, image_tab_title)
  )
)

export const cretateBookChaptersFromOriginalChapters = (bookId) => async originalChapter => {
  const originalSubchapters = R.prop('subchapters')(originalChapter)
  const chapter = await R.pipeWith(R.andThen)([
    asAsync(R.juxt([
      R.prop('title'),
      R.always(bookId),
      R.prop('order'),
      R.prop('id'),
      R.prop('image_tab_title'),
    ])),
    R.apply(createBookChapter),
  ])(originalChapter)

  await mapP(
    copyChapterImagesFromOriginalChapter(chapter.id)
  )(originalChapter.images)

  await mapP(
    cretateBookSubhaptersFromOriginalSubchapters(chapter.id)
  )(originalSubchapters)

  return chapter
}

export const fetchChapterNotes = async (command: FetchChapterNotesCommand) => {
  const result = await findSubchaptersWithNotes({
    chapterId: command.chapterId,
  })

  if (!result) {
    throw notFoundException('StudentBookChapter')
  }

  return result
}

const getSubchapterIds = R.pipe(
  R.prop('subchapters'),
  R.pluck('id')
)

const getChapterImagesIds = R.pipe(
  R.prop('chapterImages'),
  R.pluck('id')
)

const getChapterActivityTimerIds = R.pipe(
  R.prop('chapterActivityTimers'),
  R.pluck('id')
)

export const deleteChapter = async (id: string) => {
  const chapter = await findOneOrFail({ id }, ['subchapters', 'chapterImages', 'chapterActivityTimers'])

  console.log(`delete chapter start - ${id}`)

  await deleteBookmark(id)

  await R.pipe(
    getSubchapterIds,
    forEachP(deleteSubchapter)
  )(chapter)

  await R.pipe(
    getChapterImagesIds,
    forEachP(deleteBookChapterImage)
  )(chapter)

  await R.pipe(
    getChapterActivityTimerIds,
    forEachP(deleteChapterActivityTimer)
  )(chapter)

  await deleteActivityTimers(id)

  console.log(`delete chapter end - ${id}`)

  return deleteChapterById(id)
}

export const setBookmark = async (student_book_chapter_id: string, student_book_content_id: string) => (
  patch(student_book_chapter_id, {
    bookmark_id: student_book_content_id,
  })
)

export const deleteBookmark = async (student_book_chapter_id: string) => (
  patch(student_book_chapter_id, {
    bookmark_id: null,
  })
)

export const generateChatContextId = async (student_book_chapter_id: string) => (
  patch(student_book_chapter_id, {
    chat_context_id: randomUUID(),
  })
)
