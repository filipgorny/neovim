import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { fetchCustom } from '../../utils/model/fetch'
import { StudentExam } from '../../src/models'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { calculateAverageTimePerQuestionWithTargetScore } from '../../services/exam-diagnostics/calculate-target-score-average-time-per-question'
import { calculateAverageTimePerPassageWithTargetScore } from '../../services/exam-diagnostics/calculate-target-score-average-time-per-passage'

const RECORDS_PER_BATCH = 5

const log = batchNumber => console.log(`-> updating legacy exams with new timers; batch ${batchNumber}`)

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

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async exam => Promise.all([
      calculateAverageTimePerQuestionWithTargetScore(exam, { id: exam.student_id }),
      calculateAverageTimePerPassageWithTargetScore(exam, { id: exam.student_id }),
    ])
  )(batch)
}

const nextBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => fetchCustom(StudentExam.whereNotNull('completed_at'))([], buildPaginationData(batchNumber, step)),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

(
  async (): Promise<void> => {
    await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

    console.log('Updating legacy exams with new timers finished.')
    process.exit(0)
  }
)()
