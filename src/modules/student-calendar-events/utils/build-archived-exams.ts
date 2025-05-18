import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import fetchFullLengthAndHalfLengthExams from '../../calendar-full-exams/actions/fetch-full-exams-for-course'
import fetchSectionalExams from '../../calendar-section-exams/actions/fetch-section-exams-for-course'
import mapP from '@desmart/js-utils/dist/function/mapp'
import createComplexCalendarEvent from '../actions/create-complex-calendar-event'
import { CalendarEventType } from '../calendar-event-type'
import { CalendarEventStatus } from '../calendar-event-status'
import { deleteCustomExamsCalendarEvents } from '../student-calendar-events-service'

const rejectItemsWithOrder = R.reject(
  R.has('order')
)

const getTitle = (exam) => (
  exam.custom_title ? exam.custom_title : exam.title
)

const makePayload = exam => ({
  event_date: new Date(),
  exam_id: exam.exam_id,
  status: CalendarEventStatus.archived,
  title: getTitle(exam),
})

export const buildArchivedExams = async (studentCourse: StudentCourse) => {
  await deleteCustomExamsCalendarEvents(studentCourse)

  console.log('DEBUG: buildArchivedExams')

  const fullAndHalfLengthExams = await R.pipeWith(R.andThen)([
    fetchFullLengthAndHalfLengthExams,
    rejectItemsWithOrder,
  ])(studentCourse.book_course_id)

  const sectionalExams = await fetchSectionalExams(studentCourse.book_course_id)

  await mapP(
    async exam => createComplexCalendarEvent(studentCourse, {
      event_type: CalendarEventType.fullLengthExam,
      data: makePayload(exam),
    })
  )(fullAndHalfLengthExams)

  await mapP(
    async exam => createComplexCalendarEvent(studentCourse, {
      event_type: CalendarEventType.sectionExam,
      data: makePayload(exam),
    })
  )(sectionalExams)
}
