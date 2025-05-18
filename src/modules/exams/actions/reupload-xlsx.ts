import R from 'ramda'
import XLSX from 'xlsx'
import xlsxParser from '../../../../services/xlsx-parser/xlsx-parser'
import { calculateExamLength } from '../exam-length-service'
import { findOneOrFail, patch } from '../exam-repository'
import {
  examLengthMismatchException,
  examQuestionAmountMismatchException,
  throwException
} from '../../../../utils/error/error-factory'
import renameProps from '../../../../utils/object/rename-props'
import { logExamReuploaded } from '../../exam-logs/exam-logs-service'
import { updatePassagesBulk } from '../../exam-passages/exam-passage-repository'
import orm from '../../../models'
import { updateQuestionsBulk } from '../../exam-questions/exam-question-repository'

const knex = orm.bookshelf.knex

type ExtractedSet = {
  id: string,
  content: string,
  questions: Array<{
    question_content: string,
    answer_definition: string,
    explanation: string,
    id: string,
  }>
}

const findWhereOrder = order => R.find(
  R.propEq('order', order)
)

const extractPassageId = (sectionIdx, passageIdx) => R.pipe(
  findWhereOrder(sectionIdx),
  R.propOr([], 'passages'),
  findWhereOrder(passageIdx),
  R.propOr(null, 'id')
)

const extractQuestionId = (sectionIdx, passageIdx, questionIdx) => R.pipe(
  findWhereOrder(sectionIdx),
  R.propOr([], 'passages'),
  findWhereOrder(passageIdx),
  R.propOr([], 'questions'),
  findWhereOrder(questionIdx),
  R.propOr(null, 'id')
)

const extractQuestions = (sections, sectionIdx, passageIdx) => R.addIndex(R.map)(
  (questionVal, questionIdx) => R.pipe(
    R.pick(['question', 'explanation', 'answers', 'correctAnswer']),
    renameProps({
      question: 'question_content',
      answers: 'answer_definition',
      explanation: 'explanation',
      correctAnswer: 'correct_answer',
    }),
    R.evolve({
      answer_definition: JSON.stringify,
    }),
    R.assoc('id', extractQuestionId(sectionIdx, passageIdx, questionIdx + 1)(sections))
  )(questionVal)
)

const extractPassagesWithQuestions = (sections, sets): ExtractedSet[] => R.pipe(
  R.map(
    R.pipe(
      R.values,
      R.flatten
    )
  ),
  R.addIndex(R.map)(
    (sectionVal, sectionIdx) => R.addIndex(R.map)(
      (passageVal, passageIdx) => ({
        id: extractPassageId(sectionIdx + 1, passageIdx + 1)(sections),
        content: passageVal.passage,
        questions: extractQuestions(sections, sectionIdx + 1, passageIdx + 1)(passageVal.questions),
      })
    )(sectionVal)
  ),
  R.flatten,
  R.reject(
    R.propEq('id', null)
  )
)(sets)

const validateExamLength = sectionCount => R.unless(
  R.propEq('section_count', sectionCount),
  () => throwException(examLengthMismatchException())
)

const validateExamQuestionsAmount = sections => R.pipe(
  R.propOr('{}', 'question_amount'),
  JSON.parse,
  R.values,
  R.map(Number),
  definition => R.pipe(
    R.equals(
      R.pipe(
        R.pluck('amount'),
        R.map(Number)
      )(sections)
    ),
    R.when(
      R.not,
      () => throwException(examQuestionAmountMismatchException(definition))
    )
  )(definition)
)

const getExamLengthFromExamType = (examType, questionSets) => {
  const calculatedExamLength = calculateExamLength(questionSets)

  const examLength = R.pipe(
    R.prop('exam_length'),
    JSON.parse,
    R.values
  )(examType)

  const examLengthSections = R.pipe(
    R.addIndex(R.map)(
      (item, index) => (
        R.set(R.lensProp('sectionMinutes'), examLength[index], item)
      )
    )
  )(calculatedExamLength.sections)

  calculatedExamLength.sections = examLengthSections
  calculatedExamLength.summary.minutes = R.sum(examLength)

  return calculatedExamLength
}

export default async (id, files, user) => {
  const exam = await findOneOrFail({ id }, ['sections.passages.questions', 'type'])
  const sections = exam.sections
  const examType = exam.type
  const workbook = XLSX.read(files.file.data)
  const questionSets = xlsxParser(workbook)
  const calculatedExamLength = getExamLengthFromExamType(examType, questionSets)

  validateExamLength(calculatedExamLength.summary.sectionCount)(examType)
  validateExamQuestionsAmount(calculatedExamLength.sections)(examType)

  const extractedSets = extractPassagesWithQuestions(sections, questionSets)
  const passagesExtracted = R.map(
    R.pick(['id', 'content'])
  )(extractedSets)

  const questionsExtracted = R.pipe(
    R.pluck('questions'),
    R.flatten
  )(extractedSets)

  await knex.transaction(
    async trx => (
      Promise.all([
        patch(exam.id, { uploaded_at: new Date(), uploaded_by: user.id, file_name: files ? files.file.name : exam.file_name }, trx),
        ...updatePassagesBulk(passagesExtracted, trx),
        ...updateQuestionsBulk(questionsExtracted, trx),
        logExamReuploaded(exam.id, user.id, trx),
      ])
        .then(trx.commit)
        .catch(trx.rollback)
    )
  )

  return questionSets
}
