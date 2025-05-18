import R from 'ramda'
import { WorkBook } from 'xlsx'
import sheetToArray from './worksheet-utils/sheet-to-array'
import parseHeaders from './worksheet-utils/parse-headers'
import parseRow from './worksheet-utils/parse-row'
import createQuestionSet from './question-set/create-question-set'

const parseSheet = (sheetName, sheet) => {
  const sheetArr = sheetToArray(sheet)
  const [headersRow, data] = R.splitAt(1, sheetArr)
  const headers = parseHeaders(headersRow[0])

  const questionSets = R.pipe(
    R.map(parseRow(headers)),
    R.reject(
      R.isEmpty
    ),
    // R.head, // debug - first question set
    // createQuestionSet // debug - first question set
    R.map(createQuestionSet)
  )(data)

  return {
    [sheetName]: questionSets,
  }
}

export default (workbook: WorkBook) => {
  // Debug - single sheet
  // return [
  //   parseSheet('CHEMISTRY PHYSICS', workbook.Sheets['CHEMISTRY PHYSICS']),
  // ]
  return R.pipe(
    R.prop('SheetNames'),
    R.map(
      (sheetName: string) => parseSheet(sheetName, workbook.Sheets[sheetName])
    )
  )(workbook)
}
