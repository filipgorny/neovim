import mapP from '@desmart/js-utils/dist/function/mapp'
import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { initializeScoreMap } from '../../src/modules/exam-section-score-map/exam-section-score-map-service'
import { find as findExams } from '../../src/modules/exams/exam-repository'
import { setScoreCalculationMethod } from '../../src/modules/exams/exam-service'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { setSectionScores } from '../../src/modules/exam-sections/exam-section-service'
import { ScoreCalculationMethod } from '../../src/modules/exams/score-calculation-methods'
import { find as findExamTypes, patch as patchExamType } from '../../src/modules/exam-types/exam-type-repository'

const RECORDS_PER_BATCH = 10

const log = batchNumber => console.log(`-> calculate exam score maps; batch ${batchNumber}`)

const handleSectionScores = async (sections, type) => {
  const scoreRanges = JSON.parse(type.scaled_score_ranges)

  return mapP(
    async section => {
      if (section.score_min && section.score_max) {
        return
      }

      const scoreRange = scoreRanges[`section_${section.order}`]

      await setSectionScores(section.id, scoreRange[0], scoreRange[1])
    }
  )(sections)
}

const processExamBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async exam => {
      await handleSectionScores(exam.sections, exam.type)
      await setScoreCalculationMethod(exam.id, ScoreCalculationMethod.scaled)

      return initializeScoreMap(exam.id)
    }
  )(batch)
}

const nextExamBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => findExams({
      limit: { page: batchNumber + 1, take: step },
      order: { by: 'created_at', dir: 'asc' },
    }, {}, ['sections', 'type']),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

const findNewestExamByExamType = async examTypeId => {
  return R.pipeWith(R.andThen)([
    async (examTypeId) => findExams({
      limit: { page: 1, take: 1 },
      order: { by: 'created_at', dir: 'desc' },
    }, { exam_type_id: examTypeId }, ['sections']),
    R.prop('data'),
    collectionToJson,
    R.head,
  ])(examTypeId)
}

const buildExamTypeTitlesFromSections = R.pipe(
  R.sortBy(R.prop('order')),
  R.values,
  R.pluck('full_title'),
  R.zipObj(['section_1', 'section_2', 'section_3', 'section_4']),
  JSON.stringify
)

const buildExamTypeScoreRangesFromSections = R.pipe(
  R.sortBy(R.prop('order')),
  R.values,
  R.pluck('full_title'),
  R.zipObj(['section_1', 'section_2', 'section_3', 'section_4']),
  R.keys,
  R.zipObj(R.__, [[118, 132], [118, 132], [118, 132], [118, 132]]),
  JSON.stringify
)

const processExamTypeBatch = async (batch, _, batchNumber) => {
  return mapP(
    async examType => {
      if (examType.section_titles && examType.scaled_score_ranges) {
        return
      }

      const exam = await findNewestExamByExamType(examType.id)

      if (!exam) {
        return
      }

      await patchExamType(examType.id, {
        section_titles: buildExamTypeTitlesFromSections(exam.sections),
        scaled_score_ranges: buildExamTypeScoreRangesFromSections(exam.sections),
      })
    }
  )(batch)
}

const nextExamTypeBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => findExamTypes({
      limit: { page: batchNumber + 1, take: step },
      order: { by: 'title', dir: 'asc' },
    }, {}),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

const handleExamTypes = async () => {
  await processInBatches(nextExamTypeBatch, processExamTypeBatch, RECORDS_PER_BATCH)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    console.log('Creating exam score maps for all exams')

    await handleExamTypes()

    await processInBatches(nextExamBatch, processExamBatch, RECORDS_PER_BATCH)

    console.log('Done')

    process.exit(0)
  }
)()
