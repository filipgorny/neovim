import moment from 'moment'
import { debugLog } from '../../../services/completion-meter/helpers/completion-meter-helpers'
import { DATE_FORMAT_YMD } from '../../constants'
import { create, findOne, patch } from './student-completion-meters-repository'

const MIN_OIL_LEVEL = -10
const MAX_OIL_LEVEL = 0
const MAX_TEMPERATURE = 4
const MIN_TEMPERATURE = -4

const todaysDate = () => moment().format(DATE_FORMAT_YMD)

const wasOilLevelCalculatedToday = completionMeter => {
  const today = moment().format(DATE_FORMAT_YMD)
  const oilCcalculatedAt = moment(completionMeter.oil_calculated_at).format(DATE_FORMAT_YMD)

  return oilCcalculatedAt === today
}

export const createCompletionMeter = async (studentId: string, studentCourseId: string) => (
  create({
    student_id: studentId,
    student_course_id: studentCourseId,
    oil_calculated_at: moment().format(DATE_FORMAT_YMD),
  })
)

export const decreaseOilLevel = async (studentId: string, studentCourseId: string, debugMode = false) => {
  debugLog('decreaseOilLevel', debugMode)

  let completionMeter = await findOne({
    student_id: studentId,
    student_course_id: studentCourseId,
  })

  if (!completionMeter) {
    completionMeter = await createCompletionMeter(studentId, studentCourseId)
  }

  debugLog({ completionMeter }, debugMode)
  debugLog(`wasOilLevelCalculatedToday: ${wasOilLevelCalculatedToday(completionMeter)}`, debugMode)

  // If the oil level has been already calculated today, don't do it again
  // this solution will prevent further lowering of th oil level
  // because it should be recalculated every time students sees dashboard
  if (!completionMeter || wasOilLevelCalculatedToday(completionMeter)) {
    return completionMeter
  }

  const newOilLevel = Math.max(MIN_OIL_LEVEL, completionMeter.oil_level - 1)

  debugLog(`completionMeter.oil_level - 1: ${completionMeter.oil_level - 1}`, debugMode)
  debugLog(`Math.max(MIN_OIL_LEVEL, completionMeter.oil_level - 1): ${Math.max(MIN_OIL_LEVEL, completionMeter.oil_level - 1)}`, debugMode)
  debugLog(`newOilLevel = Math.max(MIN_OIL_LEVEL, completionMeter.oil_level - 1): ${newOilLevel}`, debugMode)
  debugLog(`will set: oil_level -> ${newOilLevel}, oil_calculated_at -> ${todaysDate()}`, debugMode)

  return patch(completionMeter.id, { oil_level: newOilLevel, oil_calculated_at: todaysDate() })
}

export const resetOilLevel = async (studentId: string, studentCourseId: string, debugMode = false) => {
  debugLog('resetOilLevel', debugMode)

  let completionMeter = await findOne({
    student_id: studentId,
    student_course_id: studentCourseId,
  })

  if (!completionMeter) {
    completionMeter = await createCompletionMeter(studentId, studentCourseId)
  }

  debugLog({ completionMeter }, debugMode)

  if (!completionMeter) {
    return completionMeter
  }

  debugLog(`will set: oil_level -> ${MAX_OIL_LEVEL}, oil_calculated_at -> ${todaysDate()}`, debugMode)

  return patch(completionMeter.id, { oil_level: MAX_OIL_LEVEL, oil_calculated_at: todaysDate() })
}

export const changeTemperature = async (studentId: string, studentCourseId: string, temperatureValueChange: number) => {
  const completionMeter = await findOne({
    student_id: studentId,
    student_course_id: studentCourseId,
  })

  if (!completionMeter) {
    return completionMeter
  }

  // We always add the temperature because it can be either negative or positive
  const newTemperature = temperatureValueChange > 0
    ? Math.min(MAX_TEMPERATURE, completionMeter.temperature + temperatureValueChange)
    : Math.max(MIN_TEMPERATURE, completionMeter.temperature + temperatureValueChange)

  return patch(completionMeter.id, { temperature: newTemperature })
}

export const recordPastVelocityValues = async (completionMeter, currentVelocity) => {
  if (!completionMeter) {
    return completionMeter
  }

  return patch(completionMeter.id, {
    avg_velocity_1_day_before: Math.round(currentVelocity),
    avg_velocity_2_days_before: completionMeter.avg_velocity_1_day_before,
    avg_velocity_3_days_before: completionMeter.avg_velocity_2_days_before,
  })
}

export const recordVelocityStreakValues = async (completionMeter, currentVelocity, redGreenVelocity) => (
  patch(completionMeter.id, {
    was_in_the_green_1_day_before: currentVelocity > redGreenVelocity,
    was_in_the_green_2_days_before: completionMeter.was_in_the_green_1_day_before,
    was_in_the_green_3_days_before: completionMeter.was_in_the_green_2_days_before,
  })
)
