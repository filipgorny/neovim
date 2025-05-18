import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { find } from '../custom-event-groups-repository'
import { find as findCustomEvents } from '../../student-calendar-events/student-calendar-events-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { CalendarEventType } from '../../student-calendar-events/calendar-event-type'

const markItemsAsPresentInCalendar = (idsInCalendar = [], data = []) => {
  return R.map(
    group => {
      R.addIndex(R.forEach)(
        (event, i) => {
          if (idsInCalendar.includes(event.id)) {
            group.customEventTypes[i].present_in_calendar = true
          }
        }
      )(group.customEventTypes)
      return group
    }
  )(data)
}

const markCustomEventsPresentInCalendar = async (results, studentCourse: StudentCourse) => {
  const data = R.pipe(
    R.prop('data'),
    collectionToJson
  )(results)

  const customEventItemIds = await R.pipeWith(R.andThen)([
    async () => findCustomEvents({ limit: { page: 1, take: 1000 }, order: { by: 'event_date', dir: 'asc' } }, { student_course_id: studentCourse.id, type: CalendarEventType.customEventType }),
    R.prop('data'),
    collectionToJson,
    R.pluck('student_item_id'),
  ])()

  return {
    ...results,
    data: markItemsAsPresentInCalendar(customEventItemIds, data),
  }
}

export default async (query, studentCourse?: StudentCourse) => {
  const results = await find(query, query?.filter?.course_id ? { course_id: query.filter.course_id } : {}, ['customEventTypes'])

  return studentCourse ? markCustomEventsPresentInCalendar(results, studentCourse) : results
}
