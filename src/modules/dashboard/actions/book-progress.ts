import * as R from 'ramda'
import { safeDivide } from '../../../../utils/number/safe-divide'
import { StudentCourse } from '../../../types/student-course'
import { fetchBookProgressByCourse } from '../../student-books/student-book-repository'

const toPercentValue = R.pipe(
  R.multiply(100),
  Math.round
)

const progressToPercentValue = item => (
  toPercentValue(
    safeDivide(Number(item.seen_count), Number(item.total_count))
  )
)

const calculateProgressPercentage = R.map(
  item => (
    R.set(
      R.lensProp('percent'),
      progressToPercentValue(item)
    )(item)
  )
)

export default async (student, studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async () => fetchBookProgressByCourse(student.id, studentCourse.id),
    calculateProgressPercentage,
  ])(true)
)
