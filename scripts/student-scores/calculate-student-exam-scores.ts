import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { fetchCustom } from '../../utils/model/fetch'
import { ScaledScore, StudentExam } from '../../src/models'
import { patch } from '../../src/modules/student-exams/student-exam-repository'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { STUDENT_EXAM_STATUS_COMPLETED } from '../../src/modules/student-exams/student-exam-statuses'
import { findOne as findOnePercentile } from '../../src/modules/percentile-ranks/percentile-rank-repository'
import { findCustom as findOneScaledScore } from '../../src/modules/scaled-scores/scaled-score-repository'
import { fetchExamTypeTemplates } from '../../src/modules/exam-type-scaled-score-templates/exam-type-scaled-score-template-repository'

const RECORDS_PER_BATCH = 100

const log = batchNumber => console.log(`-> calculate student exam scores; batch ${batchNumber}`)

const buildPaginationData = (batchNumber, step) => ({
  limit: {
    page: batchNumber + 1,
    take: step,
  },
  order: {
    by: 'title',
    dir: 'asc',
  },
})

const findScaledScoreTemplateId = order => examTypeTemplates => R.pipe(
  R.find(
    R.propEq('order', order)
  ),
  // @ts-ignore
  R.prop('template_id')
  // @ts-ignore
)(examTypeTemplates)

const fetchMatchingScaledScore = async (templateId, percentileRank) => R.pipeWith(R.andThen)([
  async () => findOneScaledScore(
    ScaledScore.where({ template_id: templateId }).andWhere('percentile_rank', '<=', percentileRank)
  )({ page: 1, take: 1 }, { by: 'scaled_score', dir: 'desc' }),
  R.prop('data'),
  collectionToJson,
  R.head,
])(true)

const calculateSectionScoresAndPercentile = examTypeId => async section => {
  const percentile = await findOnePercentile({
    exam_type_id: examTypeId,
    section_order: section.order,
    correct_answer_amount: section.amount_correct,
  })
  const examTypeTemplates = await fetchExamTypeTemplates(examTypeId)
  const templateId = findScaledScoreTemplateId(section.order)(examTypeTemplates)
  const scaledScoreTemplate = await fetchMatchingScaledScore(templateId, percentile.percentile_rank)

  return {
    ...section,
    // @ts-ignore
    scaled_score: scaledScoreTemplate.scaled_score,
    percentile_rank: percentile.percentile_rank,
  }
}

const mapSections = (examTypeId) => async sections => (
  mapP(
    calculateSectionScoresAndPercentile(examTypeId)
  )(sections)
)

const getExamPercentileRank = (exam_type_id, correct_answer_amount) => async () => (
  findOnePercentile({
    exam_type_id,
    section_order: 0,
    correct_answer_amount,
  })
)

const pluckAndSumProp = prop => R.pipe(
  R.pluck(prop),
  R.sum
)

const mapExam = (examTypeId, sections) => async exam => {
  const scaledScore = pluckAndSumProp('scaled_score')(sections)
  const amountCorrect = pluckAndSumProp('amount_correct')(sections)
  const percentileRank = await getExamPercentileRank(examTypeId, amountCorrect)

  return {
    ...exam,
    scaled_score: scaledScore,
    amount_correct: amountCorrect,
    // @ts-ignore
    percentile_rank: percentileRank.percentile_rank,
  }
}

const prepareScores = (examTypeId) => async exam => {
  const scores = JSON.parse(exam.scores)
  const mappedSections = await mapSections(examTypeId)(scores.sections)
  const mappedExam = await mapExam(examTypeId, mappedSections)(scores.exam)

  return {
    scores: {
      exam: mappedExam,
      sections: mappedSections,
    },
  }
}

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async exam => R.pipeWith(R.andThen)([
      prepareScores(exam.exam_type_id),
      async data => patch(exam.id, data),
    ])(exam)
  )(batch)
}

const nextBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => fetchCustom(
      StudentExam.where({ status: STUDENT_EXAM_STATUS_COMPLETED })
    )(['sections', 'type'], buildPaginationData(batchNumber, step)),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

(
  async (): Promise<void> => {
    await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

    console.log('Calculate student exam scores finished.')
    process.exit(0)
  }
)()
