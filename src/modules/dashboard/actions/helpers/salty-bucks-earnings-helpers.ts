import moment from 'moment'
import { int } from '../../../../../utils/number/int'
import { DATE_FORMAT_YMD } from '../../../../constants'

const getStartDateOfWeek = (offset = 0) => {
  const currentDayOfWeek = moment().format('d')

  return moment()
    .subtract(
      int(currentDayOfWeek) + offset,
      'days'
    )
    .format(DATE_FORMAT_YMD)
}

const getEndDateOfWeek = (offset = 0) => {
  const currentDayOfWeek = moment().format('d')

  return moment()
    .add(
      6 - parseInt(currentDayOfWeek) - offset,
      'days'
    )
    .format(DATE_FORMAT_YMD)
}

export const getStartDateOfMonth = () => (
  moment().startOf('month').format(DATE_FORMAT_YMD)
)

export const getEndDateOfMonth = () => (
  moment().endOf('month').format(DATE_FORMAT_YMD)
)

export const getStartDateOfCurrentWeek = () => (
  getStartDateOfWeek(0)
)

export const getEndDateOfCurrentWeek = () => (
  getEndDateOfWeek(0)
)

export const getStartDateOfPreviousWeek = () => (
  getStartDateOfWeek(7)
)

export const getEndDateOfPreviousWeek = () => (
  getStartDateOfWeek(1)
)
