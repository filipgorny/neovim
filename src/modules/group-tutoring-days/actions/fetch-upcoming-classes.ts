import moment from 'moment'
import { findDaysByDateRange } from '../group-tutoring-days-repository'
import { groupClassesInTimeRange } from '../../course-end-dates/actions/helpers/group-classes-in-time-range'
import { StudentCourse } from '../../../types/student-course'

export default async (studentCourse: StudentCourse) => {
  const dateStart = moment().subtract(1, 'days').format('YYYY-MM-DD')
  const dateEnd = moment().add(6, 'days').format('YYYY-MM-DD')

  const existingDays = await findDaysByDateRange(studentCourse.book_course_id, dateStart, dateEnd)

  return groupClassesInTimeRange(existingDays, dateStart, dateEnd)
}
