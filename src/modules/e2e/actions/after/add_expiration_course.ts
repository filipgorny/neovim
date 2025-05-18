import { deleteStudentCourse } from '../../../student-courses/student-course-service'

type Payload = {
  student_course_id: string,
}

export default async (payload: Payload) => (
  deleteStudentCourse(payload.student_course_id, {})
)
