import * as R from 'ramda'
import { safeDivide } from '../../utils/number/safe-divide'

export const calculateQuestionDifficulty = (correctAmount: number, allAmount: number): number => (
  R.pipe(
    R.subtract(allAmount),
    safeDivide(R.__, allAmount),
    R.multiply(100),
    Math.round
  )(correctAmount)
)
