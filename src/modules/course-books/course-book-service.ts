import * as R from 'ramda'
import { deleteByBookId, findOne, create, deleteOne, findOneOrFail, patchWhere } from './course-book-repository'

export const detachByBookId = async (book_id: string) => (
  deleteByBookId(book_id)
)

export const attachOne = async (course_id: string, book_id: string) => {
  const existingCourseBook = await findOne({ course_id, book_id })

  if (existingCourseBook) {
    return existingCourseBook
  }

  return create({ course_id, book_id, is_free_trial: false, free_trial_exam_id: null })
}

export const detachOne = async (course_id: string, book_id: string) => {
  const existingCourseBook = await findOne({ course_id, book_id })

  if (existingCourseBook) {
    return deleteOne(course_id, book_id)
  }

  return true
}

export const copyCourseBook = async (course_id: string, book_id: string, new_course_id: string) => (
  R.pipeWith(R.andThen)([
    async () => findOneOrFail({ course_id, book_id }),
    R.set(
      R.lensProp('course_id'),
      new_course_id
    ),
    create,
  ])(true)
)

export const toggleFreeTrialBook = async (course_id: string, book_id: string) => {
  const courseBook = await findOneOrFail({ course_id, book_id })

  return patchWhere({ course_id, book_id }, { is_free_trial: !courseBook.is_free_trial })
}
