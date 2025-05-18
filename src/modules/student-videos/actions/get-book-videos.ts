import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { findStudentBookVideos } from '../../student-book-videos/student-book-videos-repository'

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

export default async (student, query, studentCourse: StudentCourse) => R.pipeWith(R.andThen)([
  async () => findStudentBookVideos(student.id, studentCourse)(prepareQuery(query), query.filter),
])(true)
