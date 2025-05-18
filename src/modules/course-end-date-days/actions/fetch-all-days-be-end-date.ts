import * as R from 'ramda'
import { find } from '../course_end_date_days-repository'
import { adjustTimeZone } from '../../../../utils/datetime/adjust-time-zone'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

const fetchDays = (end_date_id: string) => async () => (
  find({ limit: { page: 1, take: 100 }, order: { by: 'class_date', dir: 'asc' } }, { end_date_id })
)

const convertTimeZone = student => day => {
  const datetimeStart = adjustTimeZone(`${day.class_date} ${day.class_time}`, student)
  const datetimeEnd = adjustTimeZone(`${day.class_date} ${day.class_time_end}`, student)

  return {
    ...day,
    weekday: datetimeStart.format('ddd'),
    weekday_end: datetimeEnd.format('ddd'),
    class_time: datetimeStart.format('HH:mm'),
    class_time_end: datetimeEnd.format('HH:mm'),
  }
}

export default async (student, end_date_id: string) => (
  R.pipeWith(R.andThen)([
    fetchDays(end_date_id),
    R.prop('data'),
    collectionToJson,
    R.map(convertTimeZone(student.toJSON())),
  ])(true)
)
