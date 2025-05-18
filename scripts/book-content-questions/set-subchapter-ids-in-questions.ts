/* eslint-disable @typescript-eslint/no-floating-promises */
import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { find, patch } from '../../src/modules/book-content-questions/book-content-questions-repository'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'

const log = batchNumber => console.log(`-> set subchapter_id in questions; batch ${batchNumber}`)

const setSubchapterId = async question => (
  patch(question.id, { subchapter_id: question.content.subchapter_id })
)

const nextBatch = async (batchNumber, step) => (
  R.pipeWith(R.andThen)([
    async () => find({
      limit: {
        page: batchNumber + 1,
        take: step,
      },
      order: { by: 'subchapter_order', dir: 'asc' },
    }, { subchapter_id: null }, ['content']),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(setSubchapterId)(batch)
}

(async () => {
  console.log('Set subchapter_id in all questions')

  const RECORDS_PER_BATCH = 10

  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

  console.log('Done')
  process.exit(0)
})()
