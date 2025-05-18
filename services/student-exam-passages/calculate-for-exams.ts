import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { calculatePassageReadingSpeed } from '../../src/modules/student-exams/actions/finish-section/calculate-passage-reading-speed'
import { find } from '../../src/modules/student-exams/student-exam-repository'
import { STUDENT_EXAM_STATUS_COMPLETED } from '../../src/modules/student-exams/student-exam-statuses'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'

const RECORDS_PER_BATCH = 5

const log = batchNumber => console.log(`-> calculate legacy passage reading times; batch ${batchNumber}`)

const buildPaginationData = (batchNumber, step) => ({
  limit: {
    page: batchNumber + 1,
    take: step,
  },
  order: {
    by: 'created_at',
    dir: 'asc',
  },
})

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return R.map(
    R.pipe(
      R.prop('sections'),
      mapP(calculatePassageReadingSpeed)
    )
  )(batch)
}

const findExams = pagination => async () => (
  find(
    pagination,
    { status: STUDENT_EXAM_STATUS_COMPLETED },
    ['sections.passages.originalPassage']
  )
)

const nextBatch = async (batchNumber, step) => (
  R.pipeWith(R.andThen)([
    findExams(
      buildPaginationData(batchNumber, step)
    ),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

export const calculatePassageReadingSpeedForExams = async () => {
  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)
}
