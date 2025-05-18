import { deleteByCourseId as deleteBookContentCourseTopicsByCourseId } from '../../book-content-course-topics/book-content-course-topics-service'
import { deleteAllByCourseId } from '../course-topics-service'

export default async (course_id: string) => {
  await deleteBookContentCourseTopicsByCourseId(course_id)

  return deleteAllByCourseId(course_id)
}
