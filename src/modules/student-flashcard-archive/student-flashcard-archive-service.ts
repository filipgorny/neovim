import mapP from '@desmart/js-utils/dist/function/mapp'
import * as R from 'ramda'
import { archiveSnapshotDoesntBelongToCourse, throwException } from '../../../utils/error/error-factory'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { getCourseBookChapterIdsByFlashcardId } from '../student-book-content-flashcards/student-book-content-flashcard-repository'
import { create, deleteByStudentFlashcardId, findAllByStudentCourseId, deleteRecord } from './student-flashcard-archive-repository'

export const unarchiveManyStudentFlashcards = async (student_flashcard_ids: string[]) => (
  mapP(unarchiveStudentFlashcard)(student_flashcard_ids)
)

export const archiveStudentFlashcard = async (student_flashcard_id: string) => (
  R.pipeWith(R.andThen)([
    async () => getCourseBookChapterIdsByFlashcardId(student_flashcard_id),
    R.prop('course_id'),
    async (student_course_id) => create({ student_flashcard_id, student_course_id }),
  ])(true)
)

export const unarchiveStudentFlashcard = async (student_flashcard_id: string) => (
  deleteByStudentFlashcardId(student_flashcard_id)
)

export const getStudentFlashcardArchiveSnapshotObjectByCourseId = async (student_course_id: string) => (
  R.pipeWith(R.andThen)([
    async () => findAllByStudentCourseId(student_course_id),
    collectionToJson,
    R.pluck('student_flashcard_id'),
    mapP(getCourseBookChapterIdsByFlashcardId),
    generateFlashcardArchiveSnaphsotObject(student_course_id),
  ])(true)
)

export type CourseBookChapterIds = {
  chapter_id: string
  book_id: string
  course_id: string
}

export const generateFlashcardArchiveSnaphsotObject = (student_course_id: string) => async (courseBookChapterIdsArray: CourseBookChapterIds[]) => {
  if (courseBookChapterIdsArray.length === 0) {
    return {
      id: student_course_id,
      amount: 0,
      books: [],
    }
  }

  const courseSnapshot = {
    id: courseBookChapterIdsArray[0].course_id,
    amount: 0,
    books: [],
  }

  for (const courseBookChapterIds of courseBookChapterIdsArray) {
    courseSnapshot.amount += 1
    const book = R.find(R.propEq('id', courseBookChapterIds.book_id))(courseSnapshot.books)

    if (!book) {
      courseSnapshot.books.push({
        id: courseBookChapterIds.book_id,
        amount: 1,
        chapters: [
          {
            id: courseBookChapterIds.chapter_id,
            amount: 1,
          },
        ],
      })
    } else {
      book.amount += 1
      const chapter = R.find(R.propEq('id', courseBookChapterIds.chapter_id))(book.chapters)

      if (!chapter) {
        book.chapters.push({
          id: courseBookChapterIds.chapter_id,
          amount: 1,
        })
      } else {
        chapter.amount += 1
      }
    }
  }

  return courseSnapshot
}

export const deepSubtractSnapshotObjects = (initial, archived) => {
  if (initial.id !== archived.id) {
    throwException(archiveSnapshotDoesntBelongToCourse())
  }

  const result = R.clone(initial)

  result.amount = result.amount - archived.amount

  R.map(
    // eslint-disable-next-line array-callback-return
    book => {
      const originalBookIndex = R.findIndex(R.propEq('id', book.id))(result.books)

      const correctedBook = R.over(
        R.lensProp('amount'),
        R.subtract(R.__, book.amount)
      )(result.books[originalBookIndex])

      result.books[originalBookIndex] = correctedBook

      const correctedChapters = R.pipe(
        R.map(
          chapter => {
            const originalChapterIndex = R.findIndex(R.propEq('id', chapter.id))(result.books[originalBookIndex].chapters)

            return R.over(
              R.lensProp('amount'),
              R.subtract(R.__, chapter.amount)
            )(result.books[originalBookIndex].chapters[originalChapterIndex])
          }
        ),
        R.values
      )(book.chapters)

      result.books[originalBookIndex].chapters = R.map(
        chapter => {
          const correctedChapter = R.find(R.propEq('id', chapter.id))(correctedChapters)

          return correctedChapter || chapter
        }
      )(result.books[originalBookIndex].chapters)
    }
  )(archived.books)

  return result
}
