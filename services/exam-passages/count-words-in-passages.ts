import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { fetch } from '../../utils/model/fetch'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { ExamPassage } from '../../src/models'
import { patch } from '../../src/modules/exam-passages/exam-passage-repository'
import { countWords } from '../../utils/string/count-words'

const RECORDS_PER_BATCH = 10

const log = batchNumber => console.log(`-> passage word count; batch ${batchNumber}`)

const buildPaginationData = (batchNumber, step) => ({
  limit: {
    page: batchNumber + 1,
    take: step,
  },
  order: {
    by: 'id',
    dir: 'desc',
  },
})

const calculateWordCount = async passage => (
  patch(passage.id, {
    word_count: countWords(passage.content),
  })
)

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(calculateWordCount)(batch)
}

const fetchPassages = (batchNumber, step) => async () => (
  fetch(ExamPassage)({}, [], buildPaginationData(batchNumber, step))
)

const nextBatch = async (batchNumber, step) => (
  R.pipeWith(R.andThen)([
    fetchPassages(batchNumber, step),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

export const countWordsInPassages = async () => (
  processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)
)
