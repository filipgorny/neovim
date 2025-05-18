/* eslint-disable @typescript-eslint/no-floating-promises */
import { DELETED_AT } from '@desmart/js-utils'
import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import orm from '../../src/models'
import { update as patchChapter } from '../../src/modules/book-chapters/book-chapter-repository'
import { findDeleted, update as patchBookContent } from '../../src/modules/book-contents/book-content-repository'
import { update as patchSubchapter } from '../../src/modules/book-subchapters/book-subchapter-repository'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'

const log = batchNumber => console.log(`-> mark as manually deleted; batch ${batchNumber}`)

const nextBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => findDeleted({
      limit: { page: batchNumber + 1, take: step },
      order: { by: DELETED_AT, dir: 'asc' },
    }, ['subchapter.chapter.book']),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async (bookContent) => {
      const book = R.path(['subchapter', 'chapter', 'book'], bookContent)

      if (!R.prop(DELETED_AT, book)) {
        if (R.path(['subchapter', 'chapter', DELETED_AT], bookContent) &&
            !R.path(['subchapter', 'chapter', 'was_manually_deleted'], bookContent)) {
          await patchChapter(R.path(['subchapter', 'chapter', 'id'], bookContent), { was_manually_deleted: true })
        }
        if (R.path(['subchapter', DELETED_AT], bookContent) &&
            !R.path(['subchapter', 'was_manually_deleted'], bookContent)) {
          await patchSubchapter(R.path(['subchapter', 'id'], bookContent), { was_manually_deleted: true })
        }
        await patchBookContent(R.prop('id', bookContent), { was_manually_deleted: true })
      }
    }
  )(batch)
}

(async () => {
  console.log('start marking all deleted items of not removed books as manually deleted')

  const RECORDS_PER_BATCH = 20

  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

  console.log('done')
  process.exit(0)
})()
