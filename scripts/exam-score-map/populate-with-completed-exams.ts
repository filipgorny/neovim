import { stitchArraysByProp } from '@desmart/js-utils'
import mapP from '@desmart/js-utils/dist/function/mapp'
import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { find as findStudentExams } from '../../src/modules/student-exams/student-exam-repository'
import { STUDENT_EXAM_STATUS_COMPLETED } from '../../src/modules/student-exams/student-exam-statuses'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { patch as patchSectionScoreMap, findOne as findSectionScoreMap } from '../../src/modules/exam-section-score-map/exam-section-score-map-repository'
import { patch as patchExamScoreMap, findOne as findExamScoreMap } from '../../src/modules/exam-score-map/exam-score-map-repository'

const RECORDS_PER_BATCH = 5

const log = batchNumber => console.log(`-> calculate exam score maps; batch ${batchNumber}`)

const countCorrectAnswers = sections => (
  R.pipe(
    R.prop('scores'),
    JSON.parse,
    R.propOr([], 'sections'),
    R.map(
      R.pick(['order', 'amount_correct'])
    )
  )(sections)
)

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async exam => {
      const correctAnswers = countCorrectAnswers(exam)
      const sectionsWithScores = stitchArraysByProp('order', exam.originalExam.sections, correctAnswers)

      const sectionScoreMaps = await mapP(
        async section => {
          /**
           * If (for any reason) we don't get a section, we skip it.
           * The number 0 is a valid value, so we can't skip that (but a simple boolean check would)
           */
          if (!section.amount_correct && section.amount_correct !== 0) {
            return
          }

          const scoreMap = await findSectionScoreMap({ section_id: section.id, correct_answers: section.amount_correct })

          if (!scoreMap) {
            console.log('SCORE MAP NOT FOUND')
            console.log({ section_id: section.id, correct_answers: section.amount_correct })
            return
          }

          return patchSectionScoreMap(scoreMap.id, {
            amount_correct: scoreMap.amount_correct + 1,
          })
        }
      )(sectionsWithScores)

      const examScaledScore = R.pipe(
        R.filter(R.identity),
        collectionToJson,
        R.pluck('score'),
        R.sum
      )(sectionScoreMaps)

      const examScoreMap = await findExamScoreMap({ exam_id: exam.exam_id, score: examScaledScore })

      if (examScoreMap) {
        await patchExamScoreMap(examScoreMap.id, {
          student_amount: examScoreMap.student_amount + 1,
        })
      }
    }
  )(batch)
}

const nextBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => findStudentExams({
      limit: { page: batchNumber + 1, take: step },
      order: { by: 'created_at', dir: 'asc' },
    }, { status: STUDENT_EXAM_STATUS_COMPLETED }, ['sections.passages.questions', 'originalExam.sections']),
    R.prop('data'),
    collectionToJson,
    R.map(
      R.evolve({
        exam_length: JSON.parse,
      })
    ),
  ])(true)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async (): Promise<void> => {
    console.log('Populate exam score maps with completed exams')

    await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

    console.log('Done')

    process.exit(0)
  }
)()
