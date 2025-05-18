import mapP from '@desmart/js-utils/dist/function/mapp'
import { StudentCourse } from '../../../types/student-course'
import { createDayOff, deleteDaysOffByStudentCourseId } from '../student-calendar-days-off-service'

type Payload = {
  days_off: string[]
}

export default async (studentCourse: StudentCourse, payload: Payload) => {
  await deleteDaysOffByStudentCourseId(studentCourse.id)

  return mapP(
    async event_date => createDayOff({ day_off_date: event_date, student_course_id: studentCourse.id })
  )(payload.days_off)
}
