import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { find as findSectionScoreMaps, patch as patchSectionScoreMap } from '../../src/modules/exam-section-score-map/exam-section-score-map-repository'
import { patch as patchExamScoreMap, find as findExamScoreMaps } from '../../src/modules/exam-score-map/exam-score-map-repository'
import { find as findSections } from '../../src/modules/exam-sections/exam-section-repository'
import { find as findExams } from '../../src/modules/exams/exam-repository'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { renameProps } from '@desmart/js-utils'

const RECORDS_PER_BATCH = 5

const log = batchNumber => console.log(`-> calculate exam / section percentile ranks (using score maps); batch ${batchNumber}`)

const calculatePercentileRank = (cf, f, n) => (
  n > 0 ? Math.round(((cf + (0.5 * f)) * 100) / n) : 0
)

const calculateN = R.pipe(
  R.pluck('frequency'),
  R.sum
)

const calculateCF = (data, currentScore) => {
  return R.pipe(
    R.filter(
      R.propSatisfies(
        R.gt(currentScore),
        'score'
      )
    ),
    R.pluck('frequency'),
    R.sum
  )(data)
}

const calculatePercentileRankForSet = (data) => {
  const N = calculateN(data)

  return R.map(
    ({ score, frequency }) => {
      return calculatePercentileRank(calculateCF(data, score), frequency, N)
    }
  )(data)
}

const recalculateSectionPercentileRanks = async (section) => {
  const scoreMaps = await R.pipeWith(R.andThen)([
    async () => findSectionScoreMaps({
      limit: { page: 1, take: 1000 },
      order: { by: 'correct_answers', dir: 'asc' },
    }, { section_id: section.id }),
    R.prop('data'),
    collectionToJson,
  ])(true)

  if (!scoreMaps || !scoreMaps.length) {
    return
  }

  const input = R.map(
    R.pipe(
      R.pick(['correct_answers', 'amount_correct']),
      renameProps({ correct_answers: 'score', amount_correct: 'frequency' })
    )
  )(scoreMaps)

  const percentileRanks = calculatePercentileRankForSet(input)

  return R.addIndex(mapP)(
    async (scoreMap, i) => (
      patchSectionScoreMap(scoreMap.id, { percentile_rank: percentileRanks[i] })
    )
  )(scoreMaps)
}

const recalculateExamPercentileRanks = async (exam) => {
  const scoreMaps = await R.pipeWith(R.andThen)([
    async () => findExamScoreMaps({
      limit: { page: 1, take: 1000 },
      order: { by: 'score', dir: 'asc' },
    }, { exam_id: exam.id }),
    R.prop('data'),
    collectionToJson,
  ])(true)

  if (!scoreMaps || !scoreMaps.length) {
    return
  }

  const input = R.map(
    R.pipe(
      R.pick(['score', 'student_amount']),
      renameProps({ student_amount: 'frequency' })
    )
  )(scoreMaps)

  const percentileRanks = calculatePercentileRankForSet(input)

  return R.addIndex(mapP)(
    async (scoreMap, i) => (
      patchExamScoreMap(scoreMap.id, { percentile_rank: percentileRanks[i] })
    )
  )(scoreMaps)
}

const processSectionBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(recalculateSectionPercentileRanks)(batch)
}

const nextSectionBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => findSections({
      limit: { page: batchNumber + 1, take: step },
      order: { by: 'title', dir: 'asc' },
    }, {}),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

const processExamBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(recalculateExamPercentileRanks)(batch)
}

const nextExamBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => findExams({
      limit: { page: batchNumber + 1, take: step },
      order: { by: 'created_at', dir: 'asc' },
    }, {}),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

export const calculatePercentileRanks = async () => {
  await Promise.all([
    processInBatches(nextSectionBatch, processSectionBatch, RECORDS_PER_BATCH),
    processInBatches(nextExamBatch, processExamBatch, RECORDS_PER_BATCH),
  ])
}
