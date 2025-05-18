import * as R from 'ramda'
import moment from 'moment'
import { debugLog, getSettingValue } from './helpers/completion-meter-helpers'
import { fetchReadContent } from '../../src/modules/student-book-contents-read/student-book-contents-read-repository'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { average, safeDivide } from '@desmart/js-utils'
import { getUnreadContentsInCourseCountByStudentCourse } from '../../src/modules/student-book-contents/student-book-content-repository'
import { fetchStudentBooksSimple } from '../../src/modules/student-books/student-book-repository'
import { calculateVelocity } from './helpers/velocity-service-helpers'

const LAST_N_DAYS = 'velocity_days_amount'
const VELOCITY_MULTIPLIER = 'velocity_multiplier'
const MAX_VELOCITY = 500

const getBookCountInCourse = async (studentCourse) => (
  R.pipeWith(R.andThen)([
    async () => fetchStudentBooksSimple(studentCourse.student_id, studentCourse.id),
    R.prop('data'),
    collectionToJson,
    R.length,
  ])(true)
)

const getReadContent = async (studentCourse, fromDate) => (
  R.pipeWith(R.andThen)([
    async () => fetchReadContent(studentCourse, fromDate),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const countBooksByContentRead = R.pipe(
  R.groupBy(
    R.prop('student_book_id')
  ),
  R.keys,
  R.length
)

const fetchReadContentAndGetAverage = async (studentCourse, fromDate) => {
  const studentBookCount = await getBookCountInCourse(studentCourse)
  const readContentData = await getReadContent(studentCourse, fromDate)

  const readBookCount = countBooksByContentRead(readContentData)

  return calculateVelocity(studentBookCount, readBookCount, readContentData)
}

const dateDiffInDaysFromToday = (futureDate) => {
  const today = moment()
  const future = moment(futureDate)

  const diffTime = future.valueOf() - today.valueOf()

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const calculateRedGreenBorder = (unreadContentCount, daysUntilEnd) => (
  R.pipe(
    safeDivide(unreadContentCount),
    Math.round,
    redGreenBorder => Math.min(redGreenBorder, MAX_VELOCITY)
  )(daysUntilEnd)
)

export const calculateVelocityByStudentCourse = async (studentCourse, debugMode = false) => {
  debugLog('CALCULATING VELOCITY', debugMode)

  const [velocityDaysAmount, veloctyMultiplier] = await Promise.all([
    getSettingValue(LAST_N_DAYS),
    getSettingValue(VELOCITY_MULTIPLIER),
  ])

  debugLog({ velocityDaysAmount }, debugMode)
  debugLog({ veloctyMultiplier }, debugMode)

  const nDaysAgo = moment().subtract(velocityDaysAmount, 'days').format('YYYY-MM-DD')

  debugLog({ nDaysAgo }, debugMode)

  const [average_velocity, unreadContentCount] = await Promise.all([
    fetchReadContentAndGetAverage(studentCourse, nDaysAgo),
    getUnreadContentsInCourseCountByStudentCourse(studentCourse),
  ])

  debugLog({ average_velocity }, debugMode)
  debugLog({ unreadContentCount }, debugMode)

  const daysUntilEnd = dateDiffInDaysFromToday(studentCourse.expected_end_date)

  debugLog({ daysUntilEnd }, debugMode)
  debugLog(`average_velocity = Math.round(average_velocity * veloctyMultiplier), ${Math.round(average_velocity * veloctyMultiplier)}`, debugMode)
  debugLog(`red_green_velocity = calculateRedGreenBorder(unreadContentCount, daysUntilEnd), ${calculateRedGreenBorder(unreadContentCount, daysUntilEnd)}`, debugMode)

  return {
    average_velocity: Math.round(average_velocity * veloctyMultiplier),
    red_green_velocity: calculateRedGreenBorder(unreadContentCount, daysUntilEnd),
  }
}
