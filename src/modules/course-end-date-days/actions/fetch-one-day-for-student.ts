import { findOneOrFail } from '../course_end_date_days-repository'
import { adjustTimeZone } from '../../../../utils/datetime/adjust-time-zone'

export default async (studentInstance, id: string) => {
  const day = await findOneOrFail({ id })
  const student = studentInstance.toJSON()

  const datetimeStart = adjustTimeZone(`${day.class_date} ${day.class_time}`, student)
  const datetimeEnd = adjustTimeZone(`${day.class_date} ${day.class_time_end}`, student)

  return {
    ...day,
    weekday: datetimeStart.format('ddd'),
    class_time: datetimeStart.format('HH:mm'),
    weekday_end: datetimeEnd.format('ddd'),
    class_time_end: datetimeEnd.format('HH:mm'),
  }
}
