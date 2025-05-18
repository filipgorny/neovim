import * as R from 'ramda'
import moment from 'moment'
import Holidays, { HolidaysTypes } from 'date-holidays'
import { StudentCourse } from '../../../types/student-course'
import { DATE_FORMAT_YMD } from '../../../constants'

const extractHolidays = (holidayRecords: HolidaysTypes.Holiday[]) => (
  R.pipe(
    // include only actual holidays
    R.filter(
      R.propSatisfies(
        type => R.includes(type, ['bank', 'public']),
        'type'
      )
    ),
    // take what is interesting
    R.map(
      R.pick(['date', 'type'])
    ),
    // prune the dates from time part
    R.map(
      R.over(
        R.lensProp('date'),
        date => moment(date).format(DATE_FORMAT_YMD)
      )
    ),
    // add timestamps for easier comparison
    R.map(
      day => (
        R.set(
          R.lensProp('date_timestamp'),
          timestampFromDate(day.date)
        )
      )(day)
    )
  )(holidayRecords)
)

const timestampFromDate = date => (new Date(date)).getTime()

// Returns the nearest holiday in given timespan or undefined
const findNearestHoliday = (min, max) => holidays => (
  R.find(
    day => day.date_timestamp >= min && day.date_timestamp <= max
  )(holidays)
)

const getDateFromMiddleOfDateSpan = (fromTimeStamp, toTimeStamp) => {
  const middleDate = new Date(fromTimeStamp + (toTimeStamp - fromTimeStamp) / 2)

  return { date: middleDate }
}

const getWeekBounds = (dateString) => {
  // Parse the input date string
  const currentDate = new Date(dateString)

  // Find the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const currentDayOfWeek = currentDate.getDay()

  // Calculate the number of days to subtract to get to the beginning of the week
  const daysToSubtract = currentDayOfWeek - 1

  // Calculate the number of days to add to get to the end of the week
  const daysToAdd = 5 - currentDayOfWeek

  // Calculate the beginning of the week (excluding weekends)
  const beginningOfWeek = new Date(currentDate)
  beginningOfWeek.setDate(currentDate.getDate() - daysToSubtract)

  // Calculate the end of the week (excluding weekends)
  const endOfWeek = new Date(currentDate)
  endOfWeek.setDate(currentDate.getDate() + daysToAdd)

  // Return the beginning and end of the week as strings
  return {
    beginningOfWeek: beginningOfWeek.toISOString().split('T')[0],
    beginningOfWeekTimeStamp: timestampFromDate(beginningOfWeek.toISOString().split('T')[0]),
    endOfWeek: endOfWeek.toISOString().split('T')[0],
    endOfWeekTimeStamp: timestampFromDate(endOfWeek.toISOString().split('T')[0]),
  }
}

export const buildDaysOffForStudentCourse = (studentCourse: StudentCourse, debug = false, useYear = undefined) => {
  const currentYear = useYear || new Date().getFullYear()
  const holidaysService = new Holidays('US')
  const holidaysArray = [
    ...holidaysService.getHolidays(currentYear),
    ...holidaysService.getHolidays(currentYear + 1), // also include next year since the course might be starting late December
  ]
  const holidays = extractHolidays(holidaysArray)

  if (debug) {
    console.log('holidays', holidays)
  }

  const courseStartTimeStamp = timestampFromDate(studentCourse.calendar_start_at)
  const examDateTimeStamp = timestampFromDate(studentCourse.exam_at)

  if (debug) {
    console.log('calendar start', studentCourse.calendar_start_at)
    console.log('exam date', studentCourse.exam_at)
  }

  let nearestHoliday = findNearestHoliday(courseStartTimeStamp, examDateTimeStamp)(holidays)

  if (debug) {
    console.log('nearestHoliday', nearestHoliday)
  }

  if (!nearestHoliday) {
    nearestHoliday = getDateFromMiddleOfDateSpan(courseStartTimeStamp, examDateTimeStamp)

    if (debug) {
      console.log('date from middle of course', nearestHoliday)
    }
  }

  const date = nearestHoliday.date

  const weekBounds = getWeekBounds(date)

  if (debug) {
    console.log('weekBounds', weekBounds)
  }

  return weekBounds
}
