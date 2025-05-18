import mapP from '@desmart/js-utils/dist/function/mapp'
import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { getListOfBookIdsByCourseId } from '../../student-books/student-book-repository'
import getPLvlStatsByBook from './get-p-lvl-stats-by-book'

const addTwoArrays = R.curry(
  (a, b) => R.addIndex(R.map)(
    (n, idx) => n + b[idx]
  )(a)
)

const addArrays = arrays => (
  R.reduce(addTwoArrays, [0, 0, 0, 0, 0, 0, 0], arrays)
)

export default async (student, studentCourse: StudentCourse) => {
  const studentBookIds = await getListOfBookIdsByCourseId(studentCourse.id)

  const booksPLvlStats = await mapP(async (studentBookId) => getPLvlStatsByBook(studentBookId, student, studentCourse))(studentBookIds)

  return addArrays(booksPLvlStats)
}
