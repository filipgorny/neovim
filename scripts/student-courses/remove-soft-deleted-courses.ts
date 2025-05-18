/* eslint-disable @typescript-eslint/no-floating-promises */
import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { find } from '../../src/modules/student-courses/student-course-repository'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { deleteStudentCourse } from '../../src/modules/student-courses/student-course-service'

const log = batchNumber => console.log(`-> remove soft-deleted courses; batch ${batchNumber}`)

const nextBatch = async (batchNumber, step) => (
  R.pipeWith(R.andThen)([
    async () => find({
      limit: {
        page: batchNumber + 1,
        take: step,
      },
      order: { by: 'external_created_at', dir: 'asc' },
    }, { is_deleted: true }),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async studentCourse => await deleteStudentCourse(studentCourse.id, {})
  )(batch)
}

(async () => {
  console.log('Remove soft-deleted student courses')

  const RECORDS_PER_BATCH = 5

  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH, 1, 5)

  console.log('Done')
  process.exit(0)
})()
