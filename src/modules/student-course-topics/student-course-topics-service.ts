import mapP from '@desmart/js-utils/dist/function/mapp'
import * as R from 'ramda'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { CourseTopic } from '../../types/course-topic-type'
import { find } from '../course-topics/course-topics-repository'
import { copyCommentsForCourse } from '../student-book-content-comments/student-book-content-comments-service'
import { copyBookContentCourseTopics } from '../student-book-content-course-topics/student-book-content-course-topics-service'
import { create as createStudentCourseTopic, patch } from './student-course-topics-repository'

const getCourseTopics = async (courseId: string) => (
  R.pipeWith(R.andThen)([
    async (course_id) => find({ limit: { take: 5000, page: 1 }, order: { by: 'order', dir: 'asc' } }, { course_id }),
    R.prop('data'),
    collectionToJson,
  ])(courseId)
)

const copyCourseTopic = (student_course_id: string) => async (courseTopic: CourseTopic) => (
  createStudentCourseTopic({
    student_course_id,
    original_course_topic_id: courseTopic.id,
  })
)

export const copyCourseTopicsForStudent = async (courseId: string, studentCourseId: string, studentId: string) => {
  const courseTopics = await getCourseTopics(courseId)

  const studentCourseTopics = await mapP(copyCourseTopic(studentCourseId))(courseTopics)

  await copyBookContentCourseTopics(studentCourseId, collectionToJson(studentCourseTopics))
  await copyCommentsForCourse(courseId, studentCourseId)
}

export const toggleIsMastered = async (id: string, is_mastered: boolean): Promise<CourseTopic> => (
  patch(id, { is_mastered })
)
