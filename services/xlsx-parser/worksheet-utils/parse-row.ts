const R = require('ramda')
import { XlsxColumn, XlsxCell } from '../../../src/types/xlsx'

const mapIndexed = R.addIndex(R.map)
const emptyValue = R.propSatisfies(R.isNil, 'value')

const makeSingleItem = (headers: XlsxColumn[]) => (value: any, i: number): XlsxCell => (
  {
    column: headers[i],
    value,
  }
)

export default (headers: XlsxColumn[]) => (row: any[]): XlsxCell[] => (
  R.pipe(
    mapIndexed(makeSingleItem(headers)),
    R.reject(emptyValue)
  )(row)
)
