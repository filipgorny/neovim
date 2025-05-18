/* eslint-disable @typescript-eslint/no-floating-promises */
import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { find } from '../../src/modules/courses/course-repository'
import { collectionToJson } from '../../utils/model/collection-to-json'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { createDefaultCalendarSettings } from '../../src/modules/calendar-settings/calendar-settings-service'

const log = batchNumber => console.log(`-> create calendar settings for all courses; batch ${batchNumber}`)

const nextBatch = async (batchNumber, step) => (
  R.pipeWith(R.andThen)([
    async () => find({
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

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(async course => createDefaultCalendarSettings(course.id))(batch)
}

(async () => {
  console.log('Create calendar settings for all courses')

  const RECORDS_PER_BATCH = 10

  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

  console.log('Done')
  process.exit(0)
})()
