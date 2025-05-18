/* eslint-disable @typescript-eslint/no-floating-promises */
import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { find as findStudents } from '../../src/modules/students/student-repository'
import createGettingStartedTasks from '../../src/modules/student-tasks/actions/create-getting-started-tasks'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'

const log = (batchNumber: number) => console.log(`-> Creating default student tasks; batch ${batchNumber}`)

const nextBatch = async (batchNumber: number, step: number) => (
  R.pipeWith(R.andThen)([
    async () => findStudents({
      limit: {
        page: batchNumber + 1,
        take: step,
      },
      order: { by: 'created_at', dir: 'asc' },
    }),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const processBatch = async (batch: any[], _, batchNumber: number) => {
  log(batchNumber)

  return mapP(async (student) => {
    await createGettingStartedTasks(student.id)
  })(batch)
}

(async () => {
  console.log('Creating default student tasks for all students')

  const RECORDS_PER_BATCH = 5

  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

  console.log('Done')
  process.exit(0)
})()
