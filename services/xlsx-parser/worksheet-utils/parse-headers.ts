const R = require('ramda')
import { makeColumn } from '../column-factory'
import { XlsxColumn } from '../../../src/types/xlsx'

export default (row: string[]): XlsxColumn[] => (
  R.map(makeColumn)(row)
)
