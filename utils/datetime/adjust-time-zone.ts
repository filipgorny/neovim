import * as R from 'ramda'
import moment from 'moment-timezone'
import { DATETIME_DATABASE_FORMAT, DEFAULT_TIME_ZONE, TIME_ZONE } from '../../src/constants'

export const adjustTimeZone = (timeString: string, student) => {
  let ts = moment.tz(timeString, DATETIME_DATABASE_FORMAT, TIME_ZONE)

  if (R.has('use_default_timezone')(student) && !student.use_default_timezone) {
    ts = ts.tz(student.timezone)
  }

  return ts
}
