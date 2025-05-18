import moment from 'moment'
import { StudentCourse } from '../../../types/student-course'
import { buildPreReadingCalendarForStudent } from '../student-pre-reading-calendar-builder'

type Payload = {
  date_start?: string,
  date_end?: string,
  is_reset?: boolean,
}

export default async (studentCourse: StudentCourse, payload: Payload) => {
  const dateStart = payload.date_start || moment().format('YYYY-MM-DD')
  const dateEnd = payload.date_end || moment().add(30, 'days').format('YYYY-MM-DD')

  return buildPreReadingCalendarForStudent(studentCourse.id, moment(dateStart), moment(dateEnd), false, false, payload.is_reset)
}
