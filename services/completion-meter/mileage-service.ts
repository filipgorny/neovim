import * as R from 'ramda'
import { int, safeDivide } from '@desmart/js-utils'
import getBookProgress from '../../src/modules/dashboard/actions/book-progress'
import { debugLog, getSettingValue } from './helpers/completion-meter-helpers'

const MAX_MILEAGE_SETTING_NAME = 'mileage_max_value'

const sumProp = propName => R.pipe(
  R.pluck(propName),
  R.map(int),
  R.sum
)

export const calculateMileage = (maxMileage: number) => (bookProgress: object[]) => (
  R.pipe(
    R.juxt([
      sumProp('seen_count'),
      sumProp('total_count'),
    ]),
    R.apply(safeDivide),
    R.multiply(maxMileage),
    Math.round
  )(bookProgress)
)

export const calculateMileageByStudentCourse = async (student, studentCourse, debugMode = false) => {
  debugLog('CALCULATING MILEAGE', debugMode)

  const bookProgress = await getBookProgress(student, studentCourse)
  const maxMileage = await getSettingValue(MAX_MILEAGE_SETTING_NAME)

  debugLog({ bookProgress }, debugMode)
  debugLog({ maxMileage }, debugMode)

  const mileage = calculateMileage(maxMileage)(bookProgress)

  debugLog({ mileage }, debugMode)

  return {
    mileage,
    max_mileage: maxMileage,
  }
}
