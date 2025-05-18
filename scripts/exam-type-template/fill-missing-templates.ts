import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { fetch, fetchFirst } from '../../utils/model/fetch'
import { ExamType, ScaledScoreTemplate } from '../../src/models'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { createExamTypeScaledScoreTemplate } from '../../src/modules/exam-type-scaled-score-templates/exam-type-scaled-score-template-service'

const RECORDS_PER_BATCH = 100

const log = batchNumber => console.log(`-> filling missing scaled score templates for all exam types; batch ${batchNumber}`)

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

const prepareOrderArray = count => R.pipe(
  R.repeat(true),
  R.addIndex(R.map)(
    (val, idx) => idx + 1
  )
)(count)

const processType = async examType => {
  const firstTemplate = await fetchFirst(ScaledScoreTemplate)({}, [])
  const sectionCount = examType.section_count
  const scaledScoreDefinitions = examType.scaledScoreDefinitions
  const orderArray = prepareOrderArray(sectionCount)
  const missingOrder = R.reject(
    // @ts-ignore
    (order): boolean => R.find(
      R.propEq('order', order)
    )(scaledScoreDefinitions)
    // @ts-ignore
  )(orderArray)

  await mapP(
    // @ts-ignore
    async order => createExamTypeScaledScoreTemplate(firstTemplate.id, examType.id, order)
  )(missingOrder)
}

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(processType)(batch)
}

const nextBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => fetch(ExamType)({}, ['scaledScoreDefinitions'], buildPaginationData(batchNumber, step)),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

(
  async (): Promise<void> => {
    await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

    console.log('Filling missing scaled score templates for all exam types.')
    process.exit(0)
  }
)()
