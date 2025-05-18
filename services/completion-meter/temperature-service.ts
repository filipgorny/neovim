import * as R from 'ramda'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { processInBatches } from '../batch/batch-processor'
import { nextBatch, debugLog, debugLogTap } from './helpers/completion-meter-helpers'
import { calculateVelocityByStudentCourse } from './velocity-service'
import { shouldChangeOilTemperature } from './helpers/temperature-service-helpers'
import { changeTemperature, createCompletionMeter, recordPastVelocityValues, recordVelocityStreakValues } from '../../src/modules/student-completion-meters/student-completion-meters-service'
import { findOneOrFail as findCourse } from '../../src/modules/student-courses/student-course-repository'
import { earnSaltyBucksForVelocityStreak } from '../salty-bucks/salty-buck-service'

const RECORDS_PER_BATCH = 5

const log = batchNumber => console.log(`-> temperature calculation; batch ${batchNumber}`)

const shouldEarnSaltyBucksForVelocityStrek = course => {
  const meter = R.prop('completionMeter')(course)

  return meter.was_in_the_green_1_day_before && meter.was_in_the_green_2_days_before && meter.was_in_the_green_3_days_before
}

const handleStudentCourse = async course => {
  const completionMeter = R.prop('completionMeter')(course)

  if (R.isEmpty(completionMeter)) {
    await createCompletionMeter(course.student_id, course.id)
  }

  const yesterdayVelocity = R.pathOr(0, ['completionMeter', 'avg_velocity_1_day_before'])(course)
  const currentVelocity = await calculateVelocityByStudentCourse(course)

  const velocityDifference = currentVelocity.average_velocity - yesterdayVelocity

  const [shouldTemperatureChange, temperatureValueChange] = shouldChangeOilTemperature(velocityDifference)

  if (shouldTemperatureChange) {
    await changeTemperature(course.student_id, course.id, temperatureValueChange)
  }

  await recordPastVelocityValues(course.completionMeter, currentVelocity.average_velocity)
  await recordVelocityStreakValues(course.completionMeter, currentVelocity.average_velocity, currentVelocity.red_green_velocity)

  const updatedCourse = await findCourse({ id: course.id }, ['completionMeter'])

  if (shouldEarnSaltyBucksForVelocityStrek(updatedCourse)) {
    await earnSaltyBucksForVelocityStreak(updatedCourse.student_id, course.id)
  }
}

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(handleStudentCourse)(batch)
}

export const calculateTemperature = async () => (
  processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)
)

export const fetchTemperatureByStudentCourse = async (studentCourse, debugMode = false) => {
  debugLog('FETCHING TEMPERATURE', debugMode)

  return R.pipeWith(R.andThen)([
    async studentCourse => findCourse({ id: studentCourse.id }, ['completionMeter']),
    R.pathOr(0, ['completionMeter', 'temperature']),
    debugLogTap(debugMode),
    R.objOf('temperature_value'),
    debugLogTap(debugMode),
  ])(studentCourse)
}
