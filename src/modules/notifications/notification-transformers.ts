import * as R from 'ramda'
import moment, { Moment } from 'moment-timezone'
import { TIME_ZONE, DATETIME_DATABASE_FORMAT, DATETIME_JSON_FORMAT } from '../../constants'
import { Notification } from './dto/notification-dto'
import { not } from 'joi'
import { getRecurringEventNextDispatchTime } from '../../../services/recurring-events/recurring-events-service'
import { NotificationType } from './notification-type'

const replaceTimezone = (datetime: Moment, fromTimezone: string, toTimezone: string): Moment => (
  moment.tz(datetime.tz(fromTimezone).format('YYYY-MM-DDTHH:mm:ss'), toTimezone)
)

export const replaceTimeZoneFromUTCToDefault = (datetime: Moment): Moment => (
  replaceTimezone(datetime, 'UTC', TIME_ZONE)
)

export const replaceTimezoneFromDefaultToUTC = (datetime: Moment): Moment => (
  replaceTimezone(datetime, TIME_ZONE, 'UTC')
)

const fixScheduledFor = (scheduled_for: string | null): string | null => (
  scheduled_for && moment(scheduled_for).tz(TIME_ZONE).format(DATETIME_JSON_FORMAT)
)

const breakScheduledFor = (scheduled_for: string | null): string | null => (
  scheduled_for && replaceTimezoneFromDefaultToUTC(moment(scheduled_for)).format(DATETIME_JSON_FORMAT).replace('+00:00', 'Z')
)

export const fixScheduledForTransformer = R.over(R.lensProp('scheduled_for'), fixScheduledFor)

export const fixMultipleScheduledForTransformer = R.over(R.lensProp('data'), R.map(fixScheduledForTransformer))

export const addBrokenScheduledForTransformer = (notification: Notification) => R.set(R.lensProp('broken_scheduled_for'), breakScheduledFor(notification.scheduled_for), notification)

export const addMultipleBrokenScheduledForTransformer = R.over(R.lensProp('data'), R.map(addBrokenScheduledForTransformer))

export const addRecurringEventNextDispatchTime = (notification: Notification) => R.set(
  R.lensProp('next_dispatch_time'),
  notification.type === NotificationType.recurring
    ? typeof notification.recurring_definition === 'string'
      ? getRecurringEventNextDispatchTime(JSON.parse(notification.recurring_definition))
      : getRecurringEventNextDispatchTime(notification.recurring_definition)
    : null,
  notification
)

export const addMultipleRecurringEventNextDispatchTime = R.over(R.lensProp('data'), R.map(addRecurringEventNextDispatchTime))
