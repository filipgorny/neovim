import * as R from 'ramda'
import { safeDivide } from '../../utils/number/safe-divide'

const pathToNumber = path => R.pipe(
  R.path(path),
  Number
)

export const calculateReadingSpeed = R.pipe(
  R.juxt([
    pathToNumber(['originalPassage', 'word_count']),
    pathToNumber(['reading']),
  ]),
  // @ts-ignore
  R.apply(safeDivide),
  R.multiply(60),
  Math.round,
  R.objOf('reading_speed')
)
