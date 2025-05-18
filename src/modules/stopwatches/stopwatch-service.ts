import moment from 'moment'
import * as R from 'ramda'
import { splitWhenever } from '../../../utils/function/split-whenever'
import { STUDY_TIME_DAY_PERIOD } from '../../constants'
import { deleteByStudentCourseId as deleteStopwatches } from './stopwatches-repository'

const weekdayFromDate = date => moment(date).format('ddd')

const appendWeekDays = R.map(
  item => (
    R.set(
      R.lensProp('weekday'),
      weekdayFromDate(item.date)
    )(item)
  )
)

const addMissingDays = (data) => {
  let daysAgo = 0

  do {
    const day = moment().subtract(daysAgo, 'days')

    const dayInSet = R.find(R.propSatisfies(date => moment(date).format('YYYY-MM-DD') === day.format('YYYY-MM-DD'), 'date'))(data)

    if (!dayInSet) {
      data.push({
        date: day.format('YYYY-MM-DD'),
        seconds: 0,
      })
    }

    daysAgo++
  } while (daysAgo < STUDY_TIME_DAY_PERIOD)

  return data
}

const sortByDate = R.sort(
  (a, b) => (
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
)

const transformData = R.pipe(
  R.mapObjIndexed(
    (value, key) => {
      return {
        name: key,
        data: R.pluck('seconds')(value),
      }
    }
  ),
  R.values
)

/**
 * Groups given stopwatches to display study time graph.
 *
 * @description
 * - add missing days (when student was not learning)
 * - append weekday names based on dates
 * - group data by weekday names
 * - transform for display
 */
export const groupStopwatchesByWeekDays = R.pipe(
  addMissingDays,
  sortByDate,
  appendWeekDays,
  R.groupBy(R.prop('weekday')),
  transformData
)

const buildThreeWeeks = () => {
  let daysAgo = 0
  const days = []

  do {
    days.unshift(moment().subtract(daysAgo, 'days').format('ddd'))

    daysAgo++
  } while (daysAgo < STUDY_TIME_DAY_PERIOD)

  return days
}

/**
 * In order to display the graph properly in the admin panel,
 * after each Saturday we need to inject an empty string.
 *
 * Note: splitWhenever removes the element we split by, that's why we need "Sat" back again.
 */
const injectEmptyStringAfterEachSaturday = R.pipe(
  // @ts-ignore
  splitWhenever(R.equals('Sat')),
  R.map(
    R.when(
      R.pipe(
        R.last,
        R.equals('Fri')
      ),
      R.concat(R.__, ['Sat', ''])
    )
  )
)

/**
 * Builds table headers for study time graph.
 *
 * @description
 * Based on today, build headers for three weeks ago so the graph
 * library can handle building the X-axis properly.
 */
export const buildStudyTimeTableHeaders = () => (
  R.pipe(
    buildThreeWeeks,
    injectEmptyStringAfterEachSaturday
  )(true)
)

export const deleteByStudentCourseId = async (student_course_id: string) => (
  deleteStopwatches(student_course_id)
)
