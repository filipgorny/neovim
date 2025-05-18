/* eslint-disable @typescript-eslint/no-floating-promises */
import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { find, patch } from '../../src/modules/books/book-repository'
import { randomExternalId } from '../../src/modules/books/random-external-id'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'

const log = batchNumber => console.log(`-> generate random external IDs; batch ${batchNumber}`)

const nextBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => find({
      limit: {
        page: batchNumber + 1,
        take: step,
      },
      order: { by: 'created_at', dir: 'asc' },
    }, { external_id: null }),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async (book) => (
      patch(book.id, {
        external_id: await randomExternalId(),
      })
    )
  )(batch)
}

(async () => {
  console.log('Generate random external IDs (EK-IDs) for all books without them')

  const RECORDS_PER_BATCH = 25

  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

  console.log('Done')
  process.exit(0)
})()
