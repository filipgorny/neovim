import { findOneOrFail as findStudentCourse } from '../student-courses/student-courses-repository'
import { buildCalendarEventsForMCAT } from './utils/mcat-event-builder'
import { copyCourseEndDateDays } from '../student-course-end-date-days/student-course-end-date-days-service'

export const buildCalendarForStudent = async (studentCourseId: string, debug = false) => {
  const studentCourse = await findStudentCourse({ id: studentCourseId })

  await copyCourseEndDateDays(studentCourse)

  await buildCalendarEventsForMCAT(studentCourse, debug)
}
