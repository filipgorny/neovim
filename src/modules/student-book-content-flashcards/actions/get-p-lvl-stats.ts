import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { fetchPLevelStats } from '../student-book-content-flashcard-repository'

const defaultQuery = ({
  limit: {
    page: 1,
    take: 10,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

export default async (studentId, query, studentCourse: StudentCourse) => (
  R.pipe(
    prepareQuery,
    R.prop('filter'),
    fetchPLevelStats(studentId, studentCourse, query.part)
  )(query)
)
