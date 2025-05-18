import R from 'ramda'
import moment, { Moment } from 'moment'
import { DATE_FORMAT_YMD, STUDY_TIME_DAY_PERIOD } from '../../../constants'
import { StudentCourse } from '../../../types/student-course'
import { buildStudyTimeTableHeaders, groupStopwatchesByWeekDays } from '../../stopwatches/stopwatch-service'
import { fetchForStudyTime } from '../../stopwatches/stopwatches-repository'
import { int } from '@desmart/js-utils'

const remapDaysWithNull = (dayName, headers) => data => R.pipe(
  R.map(
    R.pipe(
      R.filter(R.equals(dayName)),
      R.ifElse(
        R.isEmpty,
        R.always(null),
        R.always(data)
      )
    )
  ),
  R.juxt([
    R.head,
    R.last,
  ]),
  R.flatten
)(headers)

const prepareStopWatchesData = headers => R.pipe(
  groupStopwatchesByWeekDays,
  R.map(
    item => R.over(
      R.lensProp('data'),
      R.ifElse(
        R.propEq('length', headers.length),
        R.identity,
        remapDaysWithNull(item.name, headers)
      )
    )(item)
  )
)

const getNextGivenWeekDay = (weekDayNumber: number): Moment => {
  const today = moment().isoWeekday()

  if (today <= weekDayNumber) {
    return moment().isoWeekday(weekDayNumber)
  } else {
    return moment().add(1, 'weeks').isoWeekday(weekDayNumber)
  }
}

const buildDates = (weekAmount: number): string[] => {
  const dates = []

  for (let i = 0; i <= weekAmount; i++) {
    const date = getNextGivenWeekDay(6).subtract(weekAmount * 7, 'days').add(i * 7, 'days').format(DATE_FORMAT_YMD)

    dates.push(date)
  }

  dates[0] = moment(dates[0]).add(1, 'days').format(DATE_FORMAT_YMD)

  return dates
}

export default async (student, studentCourse: StudentCourse) => {
  const dateFrom = moment().subtract(STUDY_TIME_DAY_PERIOD, 'days').format(DATE_FORMAT_YMD)

  const headers = buildStudyTimeTableHeaders()
  const stopwatches = await fetchForStudyTime(
    studentCourse.id,
    student.id,
    dateFrom
  )

  const data = prepareStopWatchesData(headers)(stopwatches)

  return {
    headers,
    data,
    dates: buildDates(data[0].data.length - 1),
  }
}
