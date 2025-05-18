import * as R from 'ramda'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find as findAll, findFutureGroupTutoringDays } from '../group-tutoring-days-repository'
import { adjustTimeZone } from '../../../../utils/datetime/adjust-time-zone'
import moment from 'moment'
import { rejectPastDays } from '../../student-courses/actions/get-class'

const DAYS_7 = 7

const fetchDays = (course_id: string, all?: string) => async () => (
  all
    ? findAll({ limit: { page: 1, take: 100 }, order: { by: 'class_date', dir: 'asc' } }, { course_id })
    : findFutureGroupTutoringDays(course_id, DAYS_7)({ page: 1, take: 1000 }, { by: 'class_date', dir: 'asc' })
)

const getDateOnly = date => moment(date).format('YYYY-MM-DD')

export const convertTimeZone = student => day => {
  const datetimeStart = adjustTimeZone(`${getDateOnly(day.class_date)} ${day.class_time}`, student)
  const datetimeEnd = adjustTimeZone(`${getDateOnly(day.class_date)} ${day.class_time_end}`, student)

  return {
    ...day,
    class_date: datetimeStart.format('YYYY-MM-DD'),
    weekday: datetimeStart.format('ddd'),
    weekday_end: datetimeEnd.format('ddd'),
    class_time: datetimeStart.format('HH:mm'),
    class_time_end: datetimeEnd.format('HH:mm'),
  }
}

const sortByDatesAndHours = R.sortWith([
  R.ascend(R.prop('class_date')),
  R.ascend(R.prop('class_time')),
])

export default async (user, course_id: string, query) => (
  R.pipeWith(R.andThen)([
    fetchDays(course_id, query.all),
    R.prop('data'),
    collectionToJson,
    R.ifElse(
      () => !!query.all,
      R.identity,
      rejectPastDays
    ),
    sortByDatesAndHours,
    R.map(convertTimeZone(user.toJSON())),
  ])(true)
)
