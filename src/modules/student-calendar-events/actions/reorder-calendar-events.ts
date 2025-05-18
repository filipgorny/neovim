import { StudentCourse } from '../../../types/student-course'
import { reorderCalendarEvents } from '../student-calendar-events-service'

type Payload = {
  ids: string[]
}

export default async (studentCourse: StudentCourse, payload: Payload) => (
  reorderCalendarEvents(payload.ids)
)
