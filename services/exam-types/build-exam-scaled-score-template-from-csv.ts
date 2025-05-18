import R from 'ramda'
import XLSX, { WorkBook } from 'xlsx'
import { throwException, customException } from '../../utils/error/error-factory'
import sheetToArray from '../../services/xlsx-parser/worksheet-utils/sheet-to-array'
import parseHeaders from '../../services/xlsx-parser/worksheet-utils/parse-headers'
import parseRow from '../../services/xlsx-parser/worksheet-utils/parse-row'

const throwInvalidFileException = () => throwException(customException('file.invalid', 422, 'Invalid file attached'))

const FILE_EXTENSIONS = ['.xlsx', '.xls']

const checkFileExtension = fileName => {
  const fileExtension = R.head(
    fileName.match(/\.[^\\.]+$/gi)
  )

  return (FILE_EXTENSIONS.includes(fileExtension)) ? true : throwInvalidFileException()
}

const correctPercentileRankValue = R.over(
  // @ts-ignore
  R.lensProp('percentile'),
  R.pipe(
    Number,
    R.multiply(100),
    R.invoker(1, 'toFixed')(2),
    Number
  )
)

const checkRangeOfFirstAndLastPercentile = scoreTemplate => {
  const [min, max]: number[] = R.pipe(
    R.keys,
    R.sort(R.min),
    R.juxt([
      R.head,
      R.last,
    ]),
    R.map(Number)
  )(scoreTemplate)

  const minPercentile = scoreTemplate[min].percentile
  const maxPercentile = scoreTemplate[max].percentile
  const isInRange = value => value >= 0 && value <= 1

  return isInRange(minPercentile) && isInRange(maxPercentile)
}

const parseSheet = (sheetName, sheet) => {
  const sheetArr = sheetToArray(sheet)
  const [headersRow, data] = R.splitAt(1, sheetArr)
  const headers = parseHeaders(headersRow[0])

  return R.pipe(
    R.map(parseRow(headers)),
    R.reject(
      R.isEmpty
    ),
    R.map(
      R.pipe(
        R.map(
          obj => ({
            // @ts-ignore
            [obj.column.value]: obj.value,
          })
        ),
        R.mergeAll,
        obj => ({
          // @ts-ignore
          [obj.scaled_score]: {
            // @ts-ignore
            correct_answers: obj.correct_answers,
            // @ts-ignore
            percentile: obj.percentile,
          },
        })
      )
    ),
    // @ts-ignore
    R.mergeAll,
    R.when(
      checkRangeOfFirstAndLastPercentile, // check if first and last are between <0 1> if true, correct the values
      R.map(correctPercentileRankValue)
    )
    // @ts-ignore
  )(data)
}

const xlsxParser = (workbook: WorkBook) => R.pipe(
  R.prop('SheetNames'),
  R.head,
  (sheetName: string) => parseSheet(sheetName, workbook.Sheets[sheetName])
)(workbook)

export const buildExamScaledScoreTemplateFromCsv = file => {
  checkFileExtension(file.name)

  const workbook = XLSX.read(file.data)
  return xlsxParser(workbook)
}
