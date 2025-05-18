import { syncCourse } from '../../../courses/course-service'

type Payload = {
  student_id: string,
  course_external_id: string,
}

export default async (payload: Payload) => (
  syncCourse(payload.student_id)({
    id: payload.course_external_id,
    created_at: new Date(),
  })
)
