import { deleteByCourseTopicId as deleteBookContentCourseTopicsByCourseTopicId } from '../../book-content-course-topics/book-content-course-topics-service'
import { deleteEntity } from '../course-topics-service'

export default async (course_id: string, id: string) => {
  await deleteBookContentCourseTopicsByCourseTopicId(id)

  return deleteEntity(id)
}
