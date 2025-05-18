const R = require('ramda')
import { XlsxColumn } from '../../src/types/xlsx'
import {
  COLUMN_TYPE_QUESTION,
  COLUMN_TYPE_PASSAGE,
  COLUMN_TYPE_EXPLANATION,
  COLUMN_TYPE_CHAPTER,
  COLUMN_TYPE_ANSWER,
  COLUMN_TYPE_CORRECT_ANSWER,
  AllColumnTypes
} from './column-types'

const columnTypeFromValue = (value: string): AllColumnTypes => (
  R.cond([
    [R.test(/question/i), R.always(COLUMN_TYPE_QUESTION)],
    [R.test(/answer choice/i), R.always(COLUMN_TYPE_ANSWER)],
    [R.test(/passage/i), R.always(COLUMN_TYPE_PASSAGE)],
    [R.test(/chapter/i), R.always(COLUMN_TYPE_CHAPTER)],
    [R.test(/explanation/i), R.always(COLUMN_TYPE_EXPLANATION)],
    [R.test(/correct answer/i), R.always(COLUMN_TYPE_CORRECT_ANSWER)],
  ])(value)
)

export const makeColumn = (value: string): XlsxColumn => (
  {
    type: columnTypeFromValue(value),
    value,
  }
)
