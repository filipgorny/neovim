import * as R from 'ramda'
import { safeDivide } from '../../utils/number/safe-divide'

type Timer = {
  reading: number,
  working: number,
  checking: number
}

type TimerEntityPartial = {
  id: string,
  checking_sum: number,
  checking_divisor: number,
  checking_avg: number,
  reading_sum: number,
  reading_divisor: number,
  reading_avg: number,
  working_sum: number,
  working_divisor: number,
  working_avg: number
}

export const parseExamTimers = R.pipe(
  R.prop('timers'),
  JSON.parse
)

const removeEmptyKeys = obj => R.forEachObjIndexed(
  (val, key) => {
    if (key === '') {
      delete obj['']
    }
  }
)(obj)

export const extractQuestionTimers = R.pipe(
  R.filter(
    R.propEq('resource_type', 'question')
  ),
  removeEmptyKeys
)

export const extractPassageTimers = R.pipe(
  R.filter(
    R.propEq('resource_type', 'passage')
  ),
  removeEmptyKeys
)

const safeSum = (prop: string, questionTimer: Timer) => (question: TimerEntityPartial) => {
  const currentValue = question[`${prop}_sum`] || 0
  const newValue = questionTimer[prop] || 0

  return currentValue + newValue
}

const safeIncrement = (prop: string) => (question: TimerEntityPartial) => {
  const currentValue = question[`${prop}_divisor`] || 0

  return currentValue + 1
}

const calculateAvg = (prop: string, payload) => R.pipe(
  R.prop(`${prop}_divisor`),
  safeDivide(payload[`${prop}_sum`]),
  // @ts-ignore
  Math.round
)

export const buildTimerPayload = (timer: Timer) => (entity: TimerEntityPartial) => {
  const payload = R.applySpec({
    checking_sum: safeSum('checking', timer),
    reading_sum: safeSum('reading', timer),
    working_sum: safeSum('working', timer),
    checking_divisor: safeIncrement('checking'),
    reading_divisor: safeIncrement('reading'),
    working_divisor: safeIncrement('working'),
  })(entity)

  return R.pipe(
    R.applySpec({
      checking_avg: calculateAvg('checking', payload),
      reading_avg: calculateAvg('reading', payload),
      working_avg: calculateAvg('working', payload),
    }),
    R.mergeRight(payload)
    // @ts-ignore
  )(payload)
}

export const updateSingleEntity = (findFn, updateFn, timers: {}) => async (id: string) => (
  R.pipeWith(R.andThen)([
    findFn,
    buildTimerPayload(timers[id]),
    updateFn(id),
  ])(id)
)
