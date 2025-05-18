import moment from 'moment'
import { customException, throwException } from '../../../../utils/error/error-factory'

export const validateDateIsFromFuture = (date, fieldName = '') => {
  const isFutureDate = moment(date).isAfter(moment())

  if (!isFutureDate) {
    throwException(customException('date.invalid', 422, `Expected date (${fieldName}) must be from the future`))
  }
}

export const validateDateIsFromFutureOrToday = date => {
  const isFutureDate = moment(date).isAfter(moment().subtract(1, 'day'))

  if (!isFutureDate) {
    throwException(customException('date.invalid', 422, 'Expected end date must be from the future or today'))
  }
}
