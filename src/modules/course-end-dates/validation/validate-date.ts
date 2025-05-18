import moment from 'moment'
import { throwException, customException } from '../../../../utils/error/error-factory'

export const validateDate = (date: string) => {
  if (!moment(date).isValid()) {
    throwException(customException('date.invalid', 403, 'Invalid date'))
  }
}
