import * as R from 'ramda'
import { findOneOrFail as findCourse } from '../../src/modules/student-courses/student-course-repository'
import { debugLog, debugLogTap } from './helpers/completion-meter-helpers'

const MAX_ACCELERATION_VALUE = 50
const MIN_ACCELERATION_VALUE = -50

const getAccelerationValue = acceleration => (
  acceleration > 0
    ? Math.min(MAX_ACCELERATION_VALUE, acceleration)
    : Math.max(MIN_ACCELERATION_VALUE, acceleration)
)

export const calculateAccelerationByStudentCourse = async (studentCourse, currentVelocity, debugMode = false) => {
  debugLog('CALCULATING ACCELERATION', debugMode)

  const acceleration = await R.pipeWith(R.andThen)([
    async studentCourse => findCourse({ id: studentCourse.id }, ['completionMeter']),
    R.pathOr(0, ['completionMeter', 'avg_velocity_1_day_before']),
    debugLogTap(debugMode),
    R.subtract(currentVelocity),
    debugLogTap(debugMode),
  ])(studentCourse)

  debugLog(`acceleration_value: ${getAccelerationValue(acceleration)}`, debugMode)

  return {
    acceleration_value: getAccelerationValue(acceleration),
  }
}
