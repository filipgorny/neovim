const R = require('ramda')
import { XlsxCell } from '../../../src/types/xlsx'
import { QuestionGroup, QuestionSet } from '../../../src/types/exam'
import {
  COLUMN_TYPE_ANSWER,
  COLUMN_TYPE_CHAPTER,
  COLUMN_TYPE_EXPLANATION,
  COLUMN_TYPE_PASSAGE,
  COLUMN_TYPE_QUESTION,
  COLUMN_TYPE_CORRECT_ANSWER
} from '../column-types'
import { wrapS3ImagesInHtml } from '../../../utils/string/wrap-s3-images-in-html'

const LETTER_ARRAY = ['A', 'B', 'C', 'D', 'E', 'F']

const byTypePath = R.pathEq(['column', 'type'])

const findValueByType = (type: string) => (row: XlsxCell[]) => (
  R.pipe(
    R.find(
      byTypePath(type)
    ),
    R.prop('value')
  )(row)
)

const findAllByType = (type: string) => (row: XlsxCell[]) => (
  R.filter(
    byTypePath(type)
  )(row)
)

const findAnswersByValue = (answerNumber: string) => (dataSet: XlsxCell[]) => (
  R.filter(
    R.pipe(
      R.path(['column', 'value']),
      R.test(new RegExp(`answer choice ${answerNumber}`, 'i'))
    )
  )(dataSet)
)

const makeQuestionGroup = (question: XlsxCell, chapter: XlsxCell, explanation: XlsxCell, answers: XlsxCell[], correctAnswer?: XlsxCell): QuestionGroup => (
  {
    question: wrapS3ImagesInHtml(question.value),
    chapter: R.pipe(
      R.propOr('', 'value'),
      wrapS3ImagesInHtml
    )(chapter),
    explanation: R.pipe(
      R.propOr('', 'value'),
      wrapS3ImagesInHtml
    )(explanation),
    answers: R.pipe(
      R.pluck('value'),
      R.map(wrapS3ImagesInHtml)
    )(answers),
    correctAnswer: correctAnswer?.value,
  })

const findPassage = R.pipe(
  findValueByType(COLUMN_TYPE_PASSAGE),
  wrapS3ImagesInHtml
)

const findQuestions = findAllByType(COLUMN_TYPE_QUESTION)
const findAnswers = findAllByType(COLUMN_TYPE_ANSWER)
const findExplanations = findAllByType(COLUMN_TYPE_EXPLANATION)
const findChapters = findAllByType(COLUMN_TYPE_CHAPTER)
const findCorrectAnswers = findAllByType(COLUMN_TYPE_CORRECT_ANSWER)

const stitchWithLetters = R.zipObj(LETTER_ARRAY)

export default (row: XlsxCell[]): QuestionSet => {
  const questions = findQuestions(row)
  const answers = findAnswers(row)
  const chapters = findChapters(row)
  const explanations = findExplanations(row)
  const correctAnswers = findCorrectAnswers(row)

  const questionGroups = R.addIndex(R.map)(
    (question, i) => {
      const answersSubset = findAnswersByValue(i + 1)(answers)
      const correctAnswer = correctAnswers.length < i ? undefined : correctAnswers[i]

      return makeQuestionGroup(question, chapters[i], explanations[i], stitchWithLetters(answersSubset), correctAnswer)
    }
  )(questions)

  return {
    passage: findPassage(row),
    questions: questionGroups,
  }
}
