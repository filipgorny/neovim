/**
 * A recurring event definition example:
 *
 * {
 *   days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
 *   time: '13:50'
 * }
 */

import * as R from 'ramda'
import moment from 'moment-timezone'
import { DATE_FORMAT_YMD, DEFAULT_TIME_ZONE, POLLING_DELAY_IN_MINUTES, TIME_ZONE } from '../../src/constants'
import env from '../../utils/env'

export enum WeekDayEnum {
  Sun = 0,
  Mon = 1,
  Tue = 2,
  Wed = 3,
  Thu = 4,
  Fri = 5,
  Sat = 6,
}

export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

const WEEK_DAYS = Object.keys(WeekDayEnum) as WeekDay[]

export type RecurringEventDefinition = {
  days: WeekDay[]
  time: string
}

export const shouldDispatchRecurringNotification = (definition: RecurringEventDefinition, now?: Date) => {
  if (!now) {
    now = moment.tz(new Date(), TIME_ZONE).toDate()
  }

  const weekDay = now.toLocaleDateString('en-EN', { weekday: 'short' }) as WeekDay
  const scheduledTime = moment.tz(`${moment(now).format(DATE_FORMAT_YMD)} ${definition.time}:00.000`, TIME_ZONE)

  return definition.days.includes(weekDay) &&
    moment(now).isSameOrAfter(scheduledTime) &&
    moment(now).isBefore(scheduledTime.add(POLLING_DELAY_IN_MINUTES, 'minutes'))
}

export const getRecurringEventNextDispatchTime = (definition: RecurringEventDefinition, now?: Date) => {
  if (!now) {
    now = moment.tz(new Date(), TIME_ZONE).toDate()
  }

  const currWeekDay = now.toLocaleDateString('en-EN', { weekday: 'short' }) as WeekDay
  const currWeekDayIndex = WeekDayEnum[currWeekDay]

  const definitionWeekDayIndexes = R.pipe(
    R.map((day: WeekDay) => WeekDayEnum[day]),
    R.sortBy(R.identity)
  )(definition.days)

  const nextWeekDayIndex: number = R.cond([
    [R.pipe(R.length, R.equals(0)), () => -1],
    [R.pipe(R.length, R.equals(1)), R.head],
    [
      R.T,
      R.pipe(
        R.filter(dayIndex => dayIndex > currWeekDayIndex),
        R.head,
        R.ifElse(
          R.isNil,
          () => R.head(definitionWeekDayIndexes),
          R.identity
        )
      ),
    ],
  ])(definitionWeekDayIndexes)

  if (nextWeekDayIndex === -1) {
    return null
  }

  const isToday = definitionWeekDayIndexes.includes(currWeekDayIndex)
  const scheduledTime = moment.tz(`${moment(now).format(DATE_FORMAT_YMD)} ${definition.time}:00.000`, TIME_ZONE)

  if (isToday && moment(now).isBefore(scheduledTime)) {
    return scheduledTime.toDate()
  } else if (nextWeekDayIndex > currWeekDayIndex) {
    return scheduledTime.add(nextWeekDayIndex - currWeekDayIndex, 'days').toDate()
  } else {
    return scheduledTime.add(7 - currWeekDayIndex + nextWeekDayIndex, 'days').toDate()
  }
}
