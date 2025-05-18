import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { findStudentCourseTopicsByStudentBookContentId, findStudentCourseTopicsByTopicIds } from '../student-course-topics-repository'
import { transformDataForListView } from './helpers/list-transformers'

export default async (studentCourse: StudentCourse, student_book_content_id: string) => {
  const courseTopics = await findStudentCourseTopicsByStudentBookContentId(studentCourse, student_book_content_id)
  const courseTopicIds = R.pluck('id')(courseTopics)

  const studentCourseTopics = await findStudentCourseTopicsByTopicIds(courseTopicIds)

  return transformDataForListView(studentCourseTopics)
}
