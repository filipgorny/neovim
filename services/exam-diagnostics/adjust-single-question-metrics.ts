import * as R from 'ramda'
import { safeDivide } from '../../utils/number/safe-divide'

const adjustTimerValue = avgValues => timerPartialName => R.pipe(
  R.path(['timers', timerPartialName]),
  R.add(avgValues.timers[timerPartialName])
)

const setAvgValue = (timerName: string) => record => (
  R.set(
    R.lensPath(
      ['timers', `${timerName}_avg`]),
    R.pipe(
      R.prop('timers'),
      R.pick([`${timerName}_sum`, `${timerName}_divisor`]),
      R.values,
      // @ts-ignore
      R.apply(safeDivide),
      Math.round
      // @ts-ignore
    )(record)
  )(record)
)

const adjustPartials = adjustTimer => (
  R.applySpec({
    order: R.prop('order'),
    timers: R.applySpec({
      checking_sum: adjustTimer('checking_sum'),
      checking_divisor: adjustTimer('checking_divisor'),
      reading_sum: adjustTimer('reading_sum'),
      reading_divisor: adjustTimer('reading_divisor'),
      working_sum: adjustTimer('working_sum'),
      working_divisor: adjustTimer('working_divisor')
    })
  })
)

export const adjustSingleQuestionMetrics = R.curry(
  (avgValues, record) => (
    R.pipe(
      adjustPartials(
        adjustTimerValue(avgValues)
      ),
      setAvgValue('checking'),
      setAvgValue('reading'),
      setAvgValue('working')
      // @ts-ignore
    )(record)
  )
)
