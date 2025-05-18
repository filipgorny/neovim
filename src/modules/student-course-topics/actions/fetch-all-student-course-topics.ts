import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { findStudentCourseTopics } from '../student-course-topics-repository'
import { transformDataForListView } from './helpers/list-transformers'

const getSearchQuery = R.pathOr(undefined, ['filter', 'search'])

export default async (studentCourse: StudentCourse, query) => {
  return R.pipeWith(R.andThen)([
    async () => findStudentCourseTopics(query, { search: getSearchQuery(query), student_course_id: studentCourse.id }),
    transformDataForListView,
  ])(true)
}
