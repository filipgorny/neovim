import moment from 'moment'
import R from 'ramda'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { DATE_FORMAT_YMD } from '../../../constants'
import { SaltyBucksDailyLog } from '../../../models'
import { findCustom } from '../../salty-bucks-daily-log/salty-bucks-daily-log-repository'
import { SaltyBucksEarningsModes } from '../salty-bucks-earnings-modes'
import {
  getEndDateOfPreviousWeek,
  getStartDateOfCurrentWeek,
  getStartDateOfMonth,
  getStartDateOfPreviousWeek,
  getEndDateOfCurrentWeek,
  getEndDateOfMonth
} from './helpers/salty-bucks-earnings-helpers'
import { customException, throwException } from '@desmart/js-utils'

const adjustQuery = R.pipe(
  R.set(
    R.lensProp('order'),
    { dir: 'desc', by: 'created_at' }
  )
)

const formatDate = date => moment(date).format(DATE_FORMAT_YMD)

const adjustWhereClauseByMode = (mode: SaltyBucksEarningsModes, student_created_at) => qb => (
  R.cond([
    [R.equals(SaltyBucksEarningsModes.currentWeek), () => qb.andWhere('created_at', '>=', getStartDateOfCurrentWeek())],
    [R.equals(SaltyBucksEarningsModes.previousWeek), () => qb.andWhere('created_at', '>=', getStartDateOfPreviousWeek()).andWhere('created_at', '<=', getEndDateOfPreviousWeek())],
    [R.equals(SaltyBucksEarningsModes.currentMonth), () => qb.andWhere('created_at', '>=', getStartDateOfMonth())],
    [R.equals(SaltyBucksEarningsModes.allTime), () => qb.andWhere('created_at', '>=', student_created_at)],
    [R.T, () => qb],
  ])(mode)
)

const getDateBrackets = (mode: SaltyBucksEarningsModes, studentCreatedAt) => (
  R.cond([
    [R.equals(SaltyBucksEarningsModes.currentWeek), R.always([getStartDateOfCurrentWeek(), getEndDateOfCurrentWeek()])],
    [R.equals(SaltyBucksEarningsModes.previousWeek), R.always([getStartDateOfPreviousWeek(), getEndDateOfPreviousWeek()])],
    [R.equals(SaltyBucksEarningsModes.currentMonth), R.always([getStartDateOfMonth(), getEndDateOfMonth()])],
    [R.equals(SaltyBucksEarningsModes.allTime), R.always([studentCreatedAt, getEndDateOfCurrentWeek()])],
  ])(mode)
)

const fetchDailyLog = (query, student_id: string, student_created_at) => async (mode: SaltyBucksEarningsModes) => {
  return findCustom(
    adjustWhereClauseByMode(mode, student_created_at)(
      SaltyBucksDailyLog.where('student_id', student_id)
    )
  )(query.limit, query.order)
}

const makeEmptyDay = (dateString: string) => (
  {
    created_at: dateString,
    balance: null,
  }
)

const prepareData = R.pipe(
  R.prop('data'),
  collectionToJson,
  R.map(
    R.over(
      R.lensProp('created_at'),
      dateString => moment(dateString).format(DATE_FORMAT_YMD)
    )
  )
)

/**
 * For the chart to work properly, we have to add "missing days" (e.g. from the rest of the current month).
 */
const fillMissingDates = (mode: SaltyBucksEarningsModes, studentCreatedAt) => dataset => {
  const [start, end] = getDateBrackets(mode, studentCreatedAt)
  const startDate = moment(start)
  const endDate = moment(end).add(1, 'days')

  let date = startDate

  const data = prepareData(dataset)

  while (date.isBefore(endDate)) {
    R.pipe(
      R.find(
        R.propEq('created_at', date.format(DATE_FORMAT_YMD))
      ),
      R.when(
        R.isNil,
        () => data.push(
          makeEmptyDay(date.format(DATE_FORMAT_YMD))
        )
      )
    )(data)

    date = date.add(1, 'days')
  }

  return data
}

const adjustTodaysBalance = (balance: number) => items => {
  const today = moment().format(DATE_FORMAT_YMD)

  return R.map(
    R.when(
      R.propEq('created_at', today),
      R.assoc('balance', balance)
    )
  )(items)
}

export default async (student, query, mode: string) => {
  const studentCreatedAt = formatDate(student.get('created_at'))
  const balance = student.get('salty_bucks_balance')

  if (!(Object.values(SaltyBucksEarningsModes) as string[]).includes(mode)) {
    throwException(customException('dashboard.salty-bucks-earnings.invalid-mode', 404, 'Invalid salty bucks earnings mode'))
  }

  return R.pipeWith(R.andThen)([
    fetchDailyLog(
      adjustQuery(query),
      student.id,
      studentCreatedAt
    ),
    fillMissingDates(mode as SaltyBucksEarningsModes, studentCreatedAt),
    adjustTodaysBalance(balance),
    R.objOf('data'),
  ])(mode)
}
