import * as R from 'ramda'
import { create, patch, findOneOrFail, deleteBookById, find } from './student-book-repository'
import { makeDTO } from './dto/student-book-dto'
import { deleteChapter } from '../student-book-chapters/student-book-chapter-service'
import { deleteRecord as deleteActivityTimer } from '../student-book-activity-timers/student-book-activity-timers-repository'
import { deleteRecord as deletePinVariant } from '../student-pin-variants/student-pin-variants-repository'
import { deleteRecord as deleteRead } from '../student-book-contents-read/student-book-contents-read-repository'
import { deleteRecord as deleteFlashcardActivityTimer } from '../flashcard-activity-timers/flashcard-activity-timers-repository'
import { deleteRecord as deleteChapterActivityTimer } from '../student-book-chapter-activity-timers/student-book-chapter-activity-timers-repository'
import { deleteRecord as deleteFlashcardBox } from '../student-flashcard-boxes/student-flashcard-boxes-repository'
import mapP from '../../../utils/function/mapp'
import forEachP from '../../../utils/function/foreachp'

export const createStudentBook = (is_free_trial: boolean) => async (title: string, course_id: string, book_id: string, student_id: string, tag: string, tag_colour: string, image_url: string | null, chapter_heading_image_url: string | null, external_created_at: Date, is_test_bundle: boolean, header_abbreviation: string) => (
  create(
    makeDTO(title, course_id, book_id, student_id, tag, tag_colour, image_url, chapter_heading_image_url, external_created_at, is_free_trial, is_test_bundle, header_abbreviation)
  )
)

export const markReadChapterAndPart = async (id: string, last_chapter, last_part, student_book_subchapter_id?: string) => (
  patch(id, {
    last_chapter,
    last_part,
    last_student_book_subchapter_id_seen: student_book_subchapter_id,
  })
)

const getChapterIds = R.pipe(
  R.prop('chapters'),
  R.pluck('id')
)

const getActivityTimerIds = R.pipe(
  R.prop('activityTimers'),
  R.pluck('id')
)

const getPinVariantIds = R.pipe(
  R.prop('pinVariants'),
  R.pluck('id')
)

const getReadIds = R.pipe(
  R.prop('reads'),
  R.pluck('id')
)

const getFlashcardActivityTimerIds = R.pipe(
  R.prop('flashcardActivityTimers'),
  R.pluck('id')
)

const getChapterActivityTimerIds = R.pipe(
  R.prop('chapterActivityTimers'),
  R.pluck('id')
)

const getFlashcardBoxIds = R.pipe(
  R.prop('flashcardBoxes'),
  R.pluck('id')
)

export const deleteBook = async (id: string) => {
  const book = await findOneOrFail({ id }, ['chapters', 'activityTimers', 'pinVariants', 'reads', 'flashcardActivityTimers', 'chapterActivityTimers', 'flashcardBoxes'])

  console.log(`delete book start - ${id}`)

  await Promise.all(
    R.juxt([
      R.pipe(
        getChapterIds,
        forEachP(deleteChapter)
      ),
      R.pipe(
        getActivityTimerIds,
        forEachP(deleteActivityTimer)
      ),
      R.pipe(
        getPinVariantIds,
        forEachP(deletePinVariant)
      ),
      R.pipe(
        getReadIds,
        forEachP(deleteRead)
      ),
      R.pipe(
        getFlashcardActivityTimerIds,
        forEachP(deleteFlashcardActivityTimer)
      ),
      R.pipe(
        getChapterActivityTimerIds,
        forEachP(deleteChapterActivityTimer)
      ),
      R.pipe(
        getFlashcardBoxIds,
        forEachP(deleteFlashcardBox)
      ),
    ])(book)
  )

  console.log(`delete book end - ${id}`)

  return deleteBookById(id)
}

export const updatePreviewState = async (id: string, preview_state: string) => (
  patch(id, { preview_state })
)

export const findStudentBookById = async (id: string, withRelated: string[] = []) => (
  findOneOrFail({ id }, withRelated)
)
