import { StudentCourse } from '../../../types/student-course'
import { CalendarEventType } from '../calendar-event-type'
import { getEventFactoryByEventType } from '../utils/calendar-event-factory'

type Payload = {
  event_type: CalendarEventType,
  data: any,
}

export default async (studentCourse: StudentCourse, payload: Payload) => {
  const eventFactory = getEventFactoryByEventType(payload.event_type)

  return eventFactory(studentCourse, payload.data)
}
