import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { fetchCustom } from '../../utils/model/fetch'
import { StudentBookContentFlashcard } from '../../src/models'
import { patch } from '../../src/modules/student-book-content-flashcards/student-book-content-flashcard-repository'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'

const RECORDS_PER_BATCH = 50

const log = batchNumber => console.log(`-> copy html values from original flashcards; batch ${batchNumber}`)

const buildPaginationData = (batchNumber, step) => ({
  limit: {
    page: batchNumber + 1,
    take: step,
  },
  order: {
    by: 'id',
    dir: 'asc',
  },
})

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async flashcard => {
      const original = flashcard.originalFlashcard

      if (!flashcard || !original || !original.question_html || !original.explanation_html) {
        return
      }

      return patch(flashcard.id, {
        question_html: original.question_html,
        explanation_html: original.explanation_html,
      })
    }
  )(batch)
}

const nextBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => fetchCustom(
      StudentBookContentFlashcard.whereNull('question_html')
    )(['originalFlashcard'], buildPaginationData(batchNumber, step)),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async (): Promise<void> => {
    await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

    console.log('Copy html values finished.')
    process.exit(0)
  }
)()
