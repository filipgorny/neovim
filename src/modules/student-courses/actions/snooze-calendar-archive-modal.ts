import { StudentCourse } from '../../../types/student-course'
import { snoozeCalendarArchiveModal } from '../student-course-service'

type Payload = {
  snooze_until: string
}

export default async (studentCourse: StudentCourse, payload: Payload) => (
  snoozeCalendarArchiveModal(studentCourse, payload.snooze_until)
)
