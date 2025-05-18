import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { fetchCustom } from '../../utils/model/fetch'
import { StudentExam } from '../../src/models'
import { patch } from '../../src/modules/student-exams/student-exam-repository'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'
import asAsync from '../../utils/function/as-async'

const RECORDS_PER_BATCH = 100

const log = batchNumber => console.log(`-> remap 'scores' dla egzaminów studentów; batch ${batchNumber}`)

const buildPaginationData = (batchNumber, step) => ({
  limit: {
    page: batchNumber + 1,
    take: step,
  },
  order: {
    by: 'title',
    dir: 'asc',
  },
})

const mapSections = R.pipe(
  R.prop('sections'),
  // @ts-ignore
  sections => R.map(
    section => R.assoc(
      'order',
      1 + R.findIndex(
        // @ts-ignore
        R.propEq('id', section.id)
        // @ts-ignore
      )(sections)
    )(section)
    // @ts-ignore
  )(sections),
  R.objOf('sections')
)

const remapScores = R.pipe(
  R.prop('scores'),
  JSON.parse,
  R.juxt([
    R.pick(['exam']),
    mapSections,
  ]),
  // @ts-ignore
  R.mergeAll,
  R.objOf('scores')
)

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async exam => R.pipeWith(R.andThen)([
      asAsync(remapScores),
      async data => patch(exam.id, data),
    ])(exam)
  )(batch)
}

const nextBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => fetchCustom(StudentExam.whereNotNull('scores'))([], buildPaginationData(batchNumber, step)),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

(
  async (): Promise<void> => {
    await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

    console.log('Remap of scores in student-exams finished.')
    process.exit(0)
  }
)()
