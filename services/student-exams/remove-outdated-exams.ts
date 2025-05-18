import * as R from 'ramda'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { processInBatches } from '../batch/batch-processor'
import { findExpiredAndOutdatedExams } from '../../src/modules/student-exams/student-exam-repository'
import mapP from '../../utils/function/mapp'
import { removeStudentExam } from '../../src/modules/student-exams/student-exam-service'
import forEachP from '../../utils/function/foreachp'

const RECORDS_PER_BATCH = 5
const EXAMS_OLDER_THAN_N_DAYS = 90

const log = batchNumber => console.log(`-> calculate exam / section percentile ranks (using score maps); batch ${batchNumber}`)

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return R.pipe(
    R.pluck('id'),
    forEachP(removeStudentExam)
  )(batch)
}

const nextBatch = async (batchNumber, step) => (
  R.pipeWith(R.andThen)([
    findExpiredAndOutdatedExams(EXAMS_OLDER_THAN_N_DAYS),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

export const removeOutdatedExams = async () => (
  processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)
)
