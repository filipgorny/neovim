import R from 'ramda'
import XLSX, { WorkBook } from 'xlsx'
import { throwException, customException } from '../../utils/error/error-factory'
import sheetToArray from '../../services/xlsx-parser/worksheet-utils/sheet-to-array'
import parseHeaders from '../../services/xlsx-parser/worksheet-utils/parse-headers'
import parseRow from '../../services/xlsx-parser/worksheet-utils/parse-row'
import { XlsxCell } from '../../src/types/xlsx'
import { COLUMN_TYPE_QUESTION, COLUMN_TYPE_ANSWER, COLUMN_TYPE_CORRECT_ANSWER, COLUMN_TYPE_EXPLANATION } from '../xlsx-parser/column-types'
import { wrapS3ImagesInHtml } from '../../utils/string/wrap-s3-images-in-html'
import { BookContentQuestion } from '../../src/types/book-conntent-question'

const throwInvalidFileException = () => throwException(customException('file.invalid', 422, 'Invalid file attached'))

const FILE_EXTENSIONS = ['.xlsx', '.xls']

const checkFileExtension = fileName => {
  const fileExtension = R.head(
    fileName.match(/\.[^\\.]+$/gi)
  )

  return (FILE_EXTENSIONS.includes(fileExtension)) ? true : throwInvalidFileException()
}
const byTypePath = R.pathEq(['column', 'type'])

const findAllByType = (type: string) => (row: XlsxCell[]): XlsxCell[] => (
  R.filter(
    byTypePath(type)
  )(row)
)
// @ts-ignore
const findFirstByType = (type: string) => (row: XlsxCell[]): XlsxCell => (
  R.pipe(
    findAllByType(type),
    R.head
  )(row)
)

// @ts-ignore
const findAnswerChoiceLetter = (data: XlsxCell): string => (
  R.pipe(
    R.path(['column', 'value']),
    R.match(/[A-Z]+/g),
    R.last
  )(data)
)

const findQuestion = findFirstByType(COLUMN_TYPE_QUESTION)
const findAnswers = findAllByType(COLUMN_TYPE_ANSWER)
const findCorrectAnswers = findAllByType(COLUMN_TYPE_CORRECT_ANSWER)
const findExplanation = findFirstByType(COLUMN_TYPE_EXPLANATION)

const prepareAnswers = R.pipe(
  R.map(
    (data: XlsxCell) => ({
      [findAnswerChoiceLetter(data)]: wrapS3ImagesInHtml(data.value),
    })
  ),
  R.mergeAll
)

const createQuestion = (row: XlsxCell[]): BookContentQuestion => {
  const question: XlsxCell = findQuestion(row)
  const answers: XlsxCell[] = findAnswers(row)
  const correctAnswers: XlsxCell[] = findCorrectAnswers(row)
  const explanation: XlsxCell = findExplanation(row)

  return {
    question: wrapS3ImagesInHtml(question.value),
    explanation: wrapS3ImagesInHtml(explanation.value),
    answer_definition: prepareAnswers(answers),
    correct_answers: R.pluck('value')(correctAnswers),
  }
}

const parseSheet = (sheetName, sheet): BookContentQuestion => {
  const sheetArr = sheetToArray(sheet)
  const [headersRow, data] = R.splitAt(1, sheetArr)
  const headers = parseHeaders(headersRow[0])

  // @ts-ignore
  return R.pipe(
    R.map(parseRow(headers)),
    R.reject(
      R.isEmpty
    ),
    R.map(createQuestion),
    R.head
  )(data)
}

const xlsxParser = (workbook: WorkBook): BookContentQuestion => R.pipe(
  R.prop('SheetNames'),
  R.head,
  (sheetName: string): BookContentQuestion => parseSheet(sheetName, workbook.Sheets[sheetName])
)(workbook)

export const buildContentQuestionsFromXls = (file): BookContentQuestion => {
  checkFileExtension(file.name)

  const workbook = XLSX.read(file.data)
  return xlsxParser(workbook)
}
