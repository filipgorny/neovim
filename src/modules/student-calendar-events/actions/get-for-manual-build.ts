import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { CalendarEventType } from '../calendar-event-type'
import { buildCalendarEventsForMCATForManualSetup } from '../utils/mcat-event-builder'
import fetchAllCalendarEvents from './fetch-all-calendar-events'

const examEventTypes = [CalendarEventType.otherExam, CalendarEventType.otherExamReview, CalendarEventType.fullLengthExam, CalendarEventType.fullLengthExamReview]

const aggregateExams = R.pipe(
  R.groupBy(
    event => examEventTypes.includes(event.type) ? 'exam' : 'event'
  ),
  R.values,
  R.flatten
)

export default async (studentCourse: StudentCourse, query, force_rebuild = false) => {
  if (force_rebuild) {
    await buildCalendarEventsForMCATForManualSetup(studentCourse)
  }

  const results = await fetchAllCalendarEvents(studentCourse, { order: query.order }, false)

  const grouped = aggregateExams(results.calendar_events.data)

  results.calendar_events.data = grouped

  return results
}
