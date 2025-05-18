import moment from 'moment'
import { isFriday, isSaturday } from '../../../../utils/datetime/is-weekend'
import { StudentCourse } from '../../../types/student-course'
import { DATE_FORMAT_YMD } from '../../../constants'

export const calculateAdjustedCalendarStartDate = (studentCourse: StudentCourse) => {
  if (isFriday(studentCourse.calendar_start_at)) {
    return moment(studentCourse.calendar_start_at).add(3, 'days').format(DATE_FORMAT_YMD)
  } else if (isSaturday(studentCourse.calendar_start_at)) {
    return moment(studentCourse.calendar_start_at).add(2, 'days').format(DATE_FORMAT_YMD)
  } else {
    return moment(studentCourse.calendar_start_at).add(1, 'days').format(DATE_FORMAT_YMD)
  }
}
