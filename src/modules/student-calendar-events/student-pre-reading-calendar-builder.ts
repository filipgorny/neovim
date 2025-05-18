import { findOneOrFail as findStudentCourse } from '../student-courses/student-courses-repository'
import { Moment } from 'moment'
import { buildPreReadingCalendarEventsForMCAT } from './utils/mcat-pre-reading-event-builder'

export const buildPreReadingCalendarForStudent = async (studentCourseId: string, dateStart: Moment, dateEnd: Moment, debug = false, reschedule = false, isReset = false) => {
  const studentCourse = await findStudentCourse({ id: studentCourseId })

  await buildPreReadingCalendarEventsForMCAT(studentCourse, dateStart, dateEnd, debug, reschedule, isReset)
}
