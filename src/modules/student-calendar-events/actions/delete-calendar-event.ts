import { deleteCalendarEvent, reorderCalendarEvents } from '../student-calendar-events-service'
import * as R from 'ramda'
import { throwException, customException } from '../../../../utils/error/error-factory'
import { find, findOneOrFail } from '../student-calendar-events-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { StudentCourse } from '../../../types/student-course'

const getEventsForReorder = async event => (
  R.pipeWith(R.andThen)([
    async event => find({ limit: { page: 1, take: 100 }, order: { by: 'order', dir: 'asc' } }, { student_course_id: event.student_course_id, event_date: event.event_date }),
    R.prop('data'),
    collectionToJson,
    R.reject(R.propEq('id', event.id)),
    R.pluck('id'),
  ])(event)
)

export default async (studentCourse: StudentCourse, id: string) => {
  const event = await findOneOrFail({ id, student_course_id: studentCourse.id })

  if (!event.is_manual) {
    throwException(customException('student-caledar-events.cant-delete-auto-event', 400, 'Cannot delete automatically created event'))
  }

  const eventIds = await getEventsForReorder(event)

  await deleteCalendarEvent(id)

  return reorderCalendarEvents(eventIds)
}
