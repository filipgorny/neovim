import * as R from 'ramda'
import moment from 'moment'
import { dateFromPastException, throwException } from '../../../../utils/error/error-factory'

export const validateDateIsNotFromPast = date => {
  const today = moment().hours(0).minutes(0).seconds(0).milliseconds(0).valueOf()
  const dateToCheck = moment(date).valueOf()

  R.unless(
    R.lte(today),
    () => throwException(dateFromPastException())
  )(dateToCheck)
}
