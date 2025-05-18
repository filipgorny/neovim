import * as R from 'ramda'
import { processInBatches } from '../../batch/batch-processor'
import { find } from '../../../src/modules/books/book-repository'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import mapP from '../../../utils/function/mapp'
import { copyBook } from './copy-book'
import forEachP from '../../../utils/function/foreachp'

const RECORDS_PER_BATCH = 10

const log = batchNumber => console.log(`-> copy unlocked books; batch ${batchNumber}`)

const buildPaginationData = (batchNumber: number, step: number) => ({
  limit: {
    page: batchNumber + 1,
    take: RECORDS_PER_BATCH,
  },
  order: {
    by: 'title',
    dir: 'asc',
  },
})

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return forEachP(
    async book => copyBook(book.id)
  )(batch)
}

const getBooks = step => async (batchNumber) => (
  find(
    buildPaginationData(batchNumber, step),
    {
      is_locked: false,
      is_archived: false,
    })
)

const nextBatch = async (batchNumber, step) => (
  R.pipeWith(R.andThen)([
    getBooks(step),
    R.prop('data'),
    collectionToJson,
  ])(batchNumber)
)

export const copyUnlockedBooks = async () => {
  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)
}
