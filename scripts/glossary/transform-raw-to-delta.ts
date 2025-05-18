import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { fetchCustom } from '../../utils/model/fetch'
import { Glossary } from '../../src/models'
import { patch } from '../../src/modules/glossary/glossary-repository'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'
import asAsync from '../../utils/function/as-async'

const RECORDS_PER_BATCH = 10

const log = batchNumber => console.log(`-> remap flashcards delta to raw; batch ${batchNumber}`)

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

const insertIsString = item => item.insert && typeof item.insert === 'string'

const getDeltaFromRaw = value => (
  JSON.stringify({
    ops: [
      {
        insert: value + '\n',
      },
    ],
  })
)

const remapRawToDelta = R.pipe(
  R.juxt([
    R.pipe(
      R.prop('phrase_raw'),
      getDeltaFromRaw,
      R.objOf('phrase_delta_object')
    ),
    R.pipe(
      R.prop('explanation_raw'),
      getDeltaFromRaw,
      R.objOf('explanation_delta_object')
    ),
  ]),
  R.mergeAll
)

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async glossary => R.pipeWith(R.andThen)([
      asAsync(remapRawToDelta),
      async data => patch(glossary.id, data),
    ])(glossary)
  )(batch)
}

const nextBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => fetchCustom(
      Glossary.whereRaw("phrase_delta_object = ''")
    )([], buildPaginationData(batchNumber, step)),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async (): Promise<void> => {
    await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

    console.log('Remap glossary raw to delta finished.')
    process.exit(0)
  }
)()
