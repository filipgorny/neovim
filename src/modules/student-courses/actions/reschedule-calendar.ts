import { validateDateIsFromFuture } from '../validation/validate-date-is-from-future'
import { findOneOrFail } from '../student-courses-repository'
import { setExamAtDate, setIsPreReading, setMcatDate } from '../student-course-service'
import { rescheduleCalendarEventsForMCAT } from '../../student-calendar-events/utils/mcat-event-builder'
import { findOneOrFail as findMcatDate } from '../../mcat-dates/mcat-dates-repository'
import { int } from '@desmart/js-utils'
import { StudentCourseTypes } from '../student-course-types'
import { buildPreReadingCalendarForStudent } from '../../student-calendar-events/student-pre-reading-calendar-builder'
import moment from 'moment'
import { deleteLiveClassIncompleteCalendarEvents } from '../../student-calendar-events/student-calendar-events-service'
import buildLiveClass from '../../student-calendar-events/actions/build-live-class'

type Payload = {
  exam_at: string,
  mcat_date_id?: string,
  build_calendar?: number,
  date_end?: string,
  is_pre_reading?: boolean,
  study_days?: number,
}

const shouldArchiveEvents = (payload: Payload) => payload.study_days && int(payload.study_days) < 11

export default async (student, courseId: string, payload: Payload) => {
  console.log('rescheduleCalendar', { payload, courseId, student })

  const { exam_at, mcat_date_id } = payload
  let mcatAt

  // eslint-disable-next-line no-unneeded-ternary
  const buildCalendar = (payload.build_calendar && int(payload.build_calendar) === -1) ? false : true

  validateDateIsFromFuture(exam_at, 'exam_at')

  const course = await findOneOrFail({ id: courseId, student_id: student.id })

  if (mcat_date_id) {
    mcatAt = await findMcatDate({ id: mcat_date_id, course_id: course.book_course_id })

    validateDateIsFromFuture(mcatAt.mcat_date, 'mcat_at')
  }

  const result = await setExamAtDate(course.id, exam_at)

  if (mcatAt) {
    await setMcatDate(course.id, mcatAt.id)
  }

  await setIsPreReading(course.id, payload.is_pre_reading || false)

  const updatedCourse = await findOneOrFail({ id: courseId, student_id: student.id })

  if (buildCalendar) {
    if (updatedCourse.type !== StudentCourseTypes.liveCourse) {
      await rescheduleCalendarEventsForMCAT(updatedCourse)
    }

    if (updatedCourse.type === StudentCourseTypes.liveCourse) {
      await deleteLiveClassIncompleteCalendarEvents(updatedCourse)
      await buildPreReadingCalendarForStudent(updatedCourse.id, moment(updatedCourse.calendar_start_at), moment(payload.date_end), false, true)
      await buildLiveClass(updatedCourse, true)
    } else {
      await rescheduleCalendarEventsForMCAT(updatedCourse, false, shouldArchiveEvents(payload))
    }
  }

  return result
}
