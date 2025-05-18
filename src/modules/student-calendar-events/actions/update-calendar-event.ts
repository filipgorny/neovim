import * as R from 'ramda'
import { int } from '@desmart/js-utils'
import { findOneOrFail, find } from '../student-calendar-events-repository'
import { StudentCourse } from '../../../types/student-course'
import { fetchAndReorderCalendarEvents, increaseCalendarEventsOrderByOne, patchEntity } from '../student-calendar-events-service'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { CalendarEventStatus } from '../calendar-event-status'

type Payload = {
  title?: string,
  type?: string,
  event_date?: string,
  action_uri?: string,
  duration?: number,
  order?: number,
  status?: CalendarEventStatus,
  description?: string,
}

const findEventsToPushLower = insertedEvent => events => (
  R.pipe(
    R.filter(R.propSatisfies(order => int(order) >= int(insertedEvent.order), 'order')),
    R.reject(R.propSatisfies(id => id === insertedEvent.id, 'id'))
  )(events)
)

export default async (studentCourse: StudentCourse, id: string, payload: Payload) => {
  const event = await findOneOrFail({ id, student_course_id: studentCourse.id })
  const updatedEvent = await patchEntity(id, {
    ...payload,
    from_manual_setup: false,
  })

  if (payload.event_date && payload.order) {
    await fetchAndReorderCalendarEvents(studentCourse, event.event_date)

    const events = await find({ limit: { page: 1, take: 100 }, order: { by: 'order', dir: 'asc' } }, { student_course_id: studentCourse.id, event_date: payload.event_date })
    const eventsToPush = R.pipe(
      R.prop('data'),
      collectionToJson,
      findEventsToPushLower(updatedEvent.toJSON())
    )(events)

    await increaseCalendarEventsOrderByOne(eventsToPush)
  }

  return updatedEvent
}
