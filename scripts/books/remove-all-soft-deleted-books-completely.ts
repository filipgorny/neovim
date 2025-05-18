/* eslint-disable @typescript-eslint/no-floating-promises */
import { DELETED_AT } from '@desmart/js-utils'
import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { findDeleted } from '../../src/modules/books/book-repository'
import { deleteBookCompletely } from '../../src/modules/books/book-service'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'

const log = batchNumber => console.log(`-> delete soft deleted books; batch ${batchNumber}`)

const nextBatch = async (_, step) => {
  return R.pipeWith(R.andThen)([
    async () => findDeleted({
      limit: { page: 1, take: step },
      order: { by: DELETED_AT, dir: 'asc' },
    }),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async (book) => {
      return deleteBookCompletely(book.id)
    }
  )(batch)
}

(async () => {
  console.log('start removing all soft deleted books')

  const RECORDS_PER_BATCH = 1

  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

  console.log('done')
  process.exit(0)
})()
