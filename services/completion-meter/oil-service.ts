import * as R from 'ramda'
import moment from 'moment'
import { processInBatches } from '../../services/batch/batch-processor'
import mapP from '../../utils/function/mapp'
import { STUDENT_EXAM_STATUS_COMPLETED } from '../../src/modules/student-exams/student-exam-statuses'
import { olderThanNDays } from '@desmart/js-utils'
import { findSaltyBucksLogsForContentQuestions, findSaltyBucksLogsForFlashcards, findSaltyBucksLogsForReadingBooks, findSaltyBucksLogsForWatchingVideos } from '../../src/modules/salty-bucks-log/salty-bucks-log-repository'
import { SaltyBucksOperationSubtype } from '../../src/modules/salty-bucks-log/salty-bucks-operation-subtype'
import { decreaseOilLevel, resetOilLevel } from '../../src/modules/student-completion-meters/student-completion-meters-service'
import { debugLog, getSettingValue, nextBatch } from './helpers/completion-meter-helpers'
import { studentWasActive } from './helpers/oil-service-helpers'

const RECORDS_PER_BATCH = 5
const LAST_N_DAYS = 'oil_activity_days_amount'
const ACTIVITY_AMOUNT_THRESHOLD = 'oil_activity_amount_threshold'

const log = batchNumber => console.log(`-> oil level calculation; batch ${batchNumber}`)

const filterExamsCompletedInLastDays = activityDaysAmount => R.pipe(
  R.filter(R.propEq('status', STUDENT_EXAM_STATUS_COMPLETED)),
  R.reject(
    R.propSatisfies(
      completedAt => olderThanNDays(activityDaysAmount, completedAt),
      'completed_at'
    )
  )
)

const studentCompletedAtLeastOneExam = async (course, activityDaysAmount) => (
  R.pipe(
    R.propOr([], 'exams'),
    filterExamsCompletedInLastDays(activityDaysAmount),
    R.isEmpty,
    R.not
  )(course)
)

const atLeastN = n => R.pipe(
  R.length,
  R.lte(n)
)

const atLeastThree = atLeastN(3)
const atLeastFive = atLeastN(5)

const atLeastTenMinutes = logs => {
  const isLongActivity = R.pipe(
    R.filter(
      R.propEq('operation_subtype', SaltyBucksOperationSubtype.activeOnSite_30min)
    ),
    R.isEmpty,
    R.not
  )(logs)

  if (isLongActivity) {
    return true
  }

  return R.pipe(
    R.length,
    R.multiply(2),
    R.lte(10)
  )(logs)
}

const studentWasUsingFlashcards = async (course, fromDate) => (
  studentWasActive(findSaltyBucksLogsForFlashcards, atLeastFive)(course, fromDate)
)

const studentWasReadingBooks = async (course, fromDate) => (
  studentWasActive(findSaltyBucksLogsForReadingBooks, atLeastTenMinutes)(course, fromDate)
)

const studentWasWatchingVideos = async (course, fromDate) => (
  studentWasActive(findSaltyBucksLogsForWatchingVideos)(course, fromDate)
)

const studentWasAnsweringContentQuestions = async (course, fromDate) => (
  studentWasActive(findSaltyBucksLogsForContentQuestions, atLeastThree)(course, fromDate)
)

const countTrueValues = R.pipe(
  R.filter(R.identity),
  R.length
)

const handleStudentCourse = (fromDate, activityDaysAmount, activityAmountThreshold, debugMode = false) => async course => {
  const studentActivities = await Promise.all([
    studentCompletedAtLeastOneExam(course, activityDaysAmount),
    studentWasUsingFlashcards(course, fromDate),
    studentWasReadingBooks(course, fromDate),
    studentWasWatchingVideos(course, fromDate),
    studentWasAnsweringContentQuestions(course, fromDate),
    // studentWasPlayingGames(course, fromDate), // todo implement later, once the Amino Acid game will be done
  ])

  debugLog({ studentActivities }, debugMode)

  const activitiesAmount = countTrueValues(studentActivities)

  debugLog({ activitiesAmount }, debugMode)
  debugLog(activitiesAmount >= activityAmountThreshold ? 'will reset oil level' : 'will decrease oil level', debugMode)

  return activitiesAmount >= activityAmountThreshold
    ? resetOilLevel(course.student_id, course.id, debugMode)
    : decreaseOilLevel(course.student_id, course.id, debugMode)
}

const processBatch = (fromDate, activityDaysAmount, activityAmountThreshold) => async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(handleStudentCourse(fromDate, activityDaysAmount, activityAmountThreshold))(batch)
}

export const calculateOilLevel = async () => {
  const activityDaysAmount = await getSettingValue(LAST_N_DAYS)
  const activityAmountThreshold = await getSettingValue(ACTIVITY_AMOUNT_THRESHOLD)
  const nDaysAgo = moment().subtract(activityDaysAmount, 'days').format('YYYY-MM-DD')

  return processInBatches(nextBatch, processBatch(nDaysAgo, activityDaysAmount, activityAmountThreshold), RECORDS_PER_BATCH)
}

export const calculateOilLevelByStudentCourse = async (studentCourse, debugMode = false) => {
  debugLog('CALCULATING OIL LEVEL', debugMode)

  const activityDaysAmount = await getSettingValue(LAST_N_DAYS)
  const activityAmountThreshold = await getSettingValue(ACTIVITY_AMOUNT_THRESHOLD)
  const nDaysAgo = moment().subtract(activityDaysAmount, 'days').format('YYYY-MM-DD')

  debugLog({ activityDaysAmount }, debugMode)
  debugLog({ activityAmountThreshold }, debugMode)

  const result = await handleStudentCourse(nDaysAgo, activityDaysAmount, activityAmountThreshold, debugMode)(studentCourse)

  let resultJson

  try {
    resultJson = result.toJSON()
  } catch (error) {
    resultJson = result
  }

  debugLog({ resultJson }, debugMode)

  return {
    oil_level: resultJson.oil_level,
    oil_calculated_at: resultJson.oil_calculated_at,
  }
}
