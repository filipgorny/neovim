import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { fetchCustom, fetchFirst } from '../../utils/model/fetch'
import { ExamType, Student } from '../../src/models'
import { create } from '../../src/modules/student-exam-scores/student-exam-scores-repository'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'
import asAsync from '../../utils/function/as-async'
import StudentExamScoreDto, { makeDTO } from '../../src/modules/student-exam-scores/dto/student-exam-score-dto'

const RECORDS_PER_BATCH = 100

const log = batchNumber => console.log(`-> remap 'target_scores' dla studentów; batch ${batchNumber}`)

const extractScores = R.pick([
  'target_score',
  'target_score_section_chem_phys',
  'target_score_section_cars',
  'target_score_section_biology',
  'target_score_section_psych_soc',
])

const extractProjectedScores = R.pick([
  'projected_target_score',
  'projected_target_score_section_chem_phys',
  'projected_target_score_section_cars',
  'projected_target_score_section_biology',
  'projected_target_score_section_psych_soc',
])

const buildPaginationData = (batchNumber, step) => ({
  limit: {
    page: batchNumber + 1,
    take: step,
  },
  order: {
    by: 'created_at',
    dir: 'asc',
  },
})

const prepareScores = student => {
  const targetScores = R.values(extractScores(student))
  const projectedScores = R.values(extractProjectedScores(student))
  const list = []

  for (let i = 0; i < targetScores.length; i++) {
    list.push({
      name: i === 0 ? 'total' : `section_${i}`,
      order: i,
      target_score: targetScores[i],
      pts: projectedScores[i],
    })
  }

  return list
}

const prepareData = (examTypeId) => (student): StudentExamScoreDto => makeDTO(
  examTypeId,
  prepareScores(student),
  student.id,
  student.is_ts_attached_to_pts
)

const processBatch = (examTypeId) => async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async student => R.pipeWith(R.andThen)([
      asAsync(prepareData(examTypeId)),
      async data => create(data),
    ])(student)
  )(batch)
}

const nextBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => fetchCustom(Student.whereNotNull('target_score'))([], buildPaginationData(batchNumber, step)),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

(
  async (): Promise<void> => {
    const defaultType = await fetchFirst(ExamType)({})

    // @ts-ignore
    await processInBatches(nextBatch, processBatch(defaultType.id), RECORDS_PER_BATCH)

    console.log('Remap of target_scores for students finished.')
    process.exit(0)
  }
)()
