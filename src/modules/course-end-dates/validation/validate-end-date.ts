import moment from 'moment'
import { invalidEndDateException, throwException } from '../../../../utils/error/error-factory'

export const validateEndDate = (endDate: string) => {
  if (!moment(endDate).isValid()) {
    throwException(invalidEndDateException())
  }
}
