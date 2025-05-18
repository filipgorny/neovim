import { markAsReadByStudentCourseTopicId } from '../../student-book-content-course-topics/student-book-content-course-topics-service'
import { toggleIsMastered } from '../student-course-topics-service'

type Payload = {
  is_mastered: boolean,
}

export default async (id: string, payload: Payload) => {
  await markAsReadByStudentCourseTopicId(id, payload.is_mastered)

  return toggleIsMastered(id, payload.is_mastered)
}
