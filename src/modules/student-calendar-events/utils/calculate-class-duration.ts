import moment from 'moment'
import { ClassDay } from '../../../types/class-day'

export const calculateClassDuration = (classDay: ClassDay) => {
  const classTimeStart = moment(classDay.class_time, 'HH:mm')
  const classTimeEnd = moment(classDay.class_time_end, 'HH:mm')

  return classTimeEnd.diff(classTimeStart, 'minutes')
}
