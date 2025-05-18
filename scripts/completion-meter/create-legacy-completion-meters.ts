import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { createCompletionMeter } from '../../src/modules/student-completion-meters/student-completion-meters-service'
import { find as findStudentCourses } from '../../src/modules/student-courses/student-course-repository'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'

const RECORDS_PER_BATCH = 10

const log = batchNumber => console.log(`-> calculate student exam scores; batch ${batchNumber}`)

const tryToCreateCompletionMeter = async studentCourse => {
  try {
    await createCompletionMeter(studentCourse.student_id, studentCourse.id)
  } catch (error) {
    console.log('Completion meter already exists')
  }
}

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(tryToCreateCompletionMeter)(batch)
}

const nextBatch = async (batchNumber, step) => {
  return R.pipeWith(R.andThen)([
    async () => findStudentCourses({
      limit: { page: batchNumber + 1, take: step },
      order: { by: 'external_created_at', dir: 'asc' },
    }),
    R.prop('data'),
    collectionToJson,
  ])(true)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(
  async () => {
    console.log('Creating legacy completion meters for all student courses')

    await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)

    console.log('Done')

    process.exit(0)
  }
)()
