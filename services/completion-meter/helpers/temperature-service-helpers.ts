import * as R from 'ramda'

const INCREASE_THRESHOLD = 25
const DECREASE_THRESHOLD = -25

export const shouldChangeOilTemperature = (velocityDifference: number): [boolean, number] => (
  R.cond([
    [R.lt(INCREASE_THRESHOLD), R.always([true, 1])],
    [R.gt(DECREASE_THRESHOLD), R.always([true, -1])],
    [R.T, R.always([false, 0])],
  ])(velocityDifference)
)
