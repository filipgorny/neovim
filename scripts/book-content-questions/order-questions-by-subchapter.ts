/* eslint-disable @typescript-eslint/no-floating-promises */
import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { find } from '../../src/modules/books/book-repository'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { reorderQuestionsByBook } from '../../services/book-content-questions/reorder-content-questions-in-a-book'

const log = batchNumber => console.log(`-> order questions by subchapters; batch ${batchNumber}`)

const nextBatch = async (batchNumber, step) => (
  R.pipeWith(R.andThen)([
    async () => find({
      limit: {
        page: batchNumber + 1,
        take: step,
      },
      order: { by: 'created_at', dir: 'asc' },
    }, {}, ['chapters.subchapters.contents.questions']),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(reorderQuestionsByBook)(batch)
}

(async () => {
  console.log('Order questions by subchapter in all books')

  const RECORDS_PER_BATCH = 5

  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

  console.log('Done')
  process.exit(0)
})()
