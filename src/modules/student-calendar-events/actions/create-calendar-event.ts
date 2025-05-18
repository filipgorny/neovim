import { StudentCourse } from '../../../types/student-course'
import { createEntity } from '../student-calendar-events-service'
import { CalendarEventStatus } from '../calendar-event-status'
import { find } from '../student-calendar-events-repository'
import { int } from '@desmart/js-utils'
import { CalendarEventType } from '../calendar-event-type'

type Payload = {
  title: string,
  type: string,
  event_date: string,
  duration: number,
  action_uri?: string,
  description?: string,
  status?: CalendarEventStatus,
}

const getNextOrder = async (studentCourse: StudentCourse, date: string) => {
  const events = await find({ limit: { page: 1, take: 1 }, order: { by: 'order', dir: 'desc' } }, { student_course_id: studentCourse.id, event_date: date })

  return int(events.meta.recordsTotal) + 1
}

export default async (studentCourse: StudentCourse, payload: Payload) => {
  const nextOrder = await getNextOrder(studentCourse, payload.event_date)

  return createEntity({ ...payload, student_course_id: studentCourse.id, status: payload.status || CalendarEventStatus.incomplete, order: nextOrder, is_manual: true, type: CalendarEventType.custom })
}
