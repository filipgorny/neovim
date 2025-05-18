import * as R from 'ramda'
import Papa from 'papaparse'
import { Response } from 'express'
import mapP from '../../../../utils/function/mapp'
import { findOne } from '../exam-repository'
import { flattenQuestionsCustom } from '../../../../services/student-exams/flatten-questions'
import { find } from '../../percentile-ranks/percentile-rank-repository'
import { fetchExamTypeTemplatesWithScores } from '../../exam-type-scaled-score-templates/exam-type-scaled-score-template-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

type Payload = {
  ids: string[]
}

const fetchExamWithQuestions = async (id: string) => (
  R.pipeWith(R.andThen)([
    async id => findOne({ id }, ['sections.passages.questions']),
    R.over(
      R.lensProp('exam_length'),
      JSON.parse
    ),
  ])(id)
)

const pickQuestionOrder = R.pick(['order'])
const pickQuestionData = R.pick(['difficulty_percentage', 'correct_answer'])

const processQuestion = (test_name, test_section) => question => ({
  ...pickQuestionOrder(question),
  test_name,
  test_section,
  ...pickQuestionData(question),
  answer_a: R.pathOr(0, ['answer_distribution', 'A', 'percentage'])(question),
  answer_b: R.pathOr(0, ['answer_distribution', 'B', 'percentage'])(question),
  answer_c: R.pathOr(0, ['answer_distribution', 'C', 'percentage'])(question),
  answer_d: R.pathOr(0, ['answer_distribution', 'D', 'percentage'])(question),
})

const processSection = testName => section => (
  R.map(processQuestion(testName, section.title))(section.questions)
)

const findPercentileRank = (percentileRanks, defaultValue) => score => (
  R.pipe(
    R.filter(
      R.propSatisfies(
        percentile_rank => Number(percentile_rank) <= Number(score.percentile_rank),
        'percentile_rank'
      )
    ),
    R.last,
    R.when(
      R.isNil,
      R.always(defaultValue)
    ),
    R.mergeRight(score)
    // @ts-ignore
  )(percentileRanks)
)

const findCorrectAnswerAmountForScaledScores = (scaledScores, percentileRanks) => {
  const scoresSorted = R.sortBy(R.prop('scaled_score'))(scaledScores)
  const ranksSorted = R.sortBy(R.prop('correct_answer_amount'))(percentileRanks)

  // @ts-ignore
  const defaultValue = R.mergeRight(scoresSorted[0])(ranksSorted[0])

  const ranks = R.map(
    findPercentileRank(ranksSorted, defaultValue)
  )(scoresSorted)

  return ranks
}

const findPercentileRanks = async (exam_type_id, section_order) => (
  R.pipeWith(R.andThen)([
    async () => find({ limit: { take: 100, page: 1 }, order: {} }, {
      section_order, exam_type_id,
    }),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const processSectionScores = async sectionData => {
  const { order, exam_type_id } = sectionData
  const scores = R.path(['template', 'scores'])(sectionData)
  const percentileRanks = await findPercentileRanks(exam_type_id, order)

  const result = findCorrectAnswerAmountForScaledScores(scores, percentileRanks)

  return R.map(
    R.pick(['section_order', 'correct_answer_amount', 'scaled_score', 'percentile_rank'])
  )(result)
}

const processScores = async exam => {
  const scoreTemplates = await fetchExamTypeTemplatesWithScores(exam.exam_type_id)

  return mapP(processSectionScores)(scoreTemplates)
}

const processSingleExamData = async (id: string) => {
  const exam = await fetchExamWithQuestions(id)

  const flatSections = flattenQuestionsCustom(exam, {
    withCorrectAnswer: true,
    questionDecorator: R.pick(['difficulty_percentage', 'answer_distribution']),
  })

  const scores = await processScores(exam)

  return R.pipe(
    R.map(processSection(exam.title)),
    R.concat(R.__, scores)
  )(flatSections)
}

const buildCsvForSection = section => {
  return Papa.unparse(section)
}

const buildCsvForExam = exam => {
  return R.map(buildCsvForSection)(exam)
}

const buildCsv = data => {
  return R.pipe(
    R.map(buildCsvForExam),
    R.flatten,
    R.join('\r\n')
  )(data)
}

export default async (res: Response, payload: Payload) => {
  const { ids } = payload

  const data = await mapP(
    processSingleExamData
  )(ids)

  const result = buildCsv(data)

  res.attachment('exam-export.csv').send(result)
}
