import * as R from 'ramda'
import { processInBatches } from '../batch/batch-processor'
import { findOutdatedAccounts, findOutdatedNotUsedAccounts } from '../../src/modules/students/student-repository'
import forEachP from '../../utils/function/foreachp'
import { deleteStudentCourse } from '../../src/modules/student-courses/student-course-service'
import { find as findStudentCourses } from '../../src/modules/student-courses/student-course-repository'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { removeStudentAccount, removeStudentAccountSoftly } from '../../src/modules/students/student-service'

const RECORDS_PER_BATCH = 5

const log = batchNumber => console.log(`-> remove outdated student accounts; batch ${batchNumber}`)

const findStudentCoursesToDelete = async student => (
  R.pipeWith(R.andThen)([
    async () => findStudentCourses({ limit: { page: 1, take: 100 }, order: { by: 'title', dir: 'desc' } }, { student_id: student.id }),
    R.prop('data'),
    collectionToJson,
  ])(student)
)

const removeStudent = async student => {
  const studentCourses = await findStudentCoursesToDelete(student)

  await forEachP(
    async (studentCourse) => deleteStudentCourse(studentCourse.id, null)
  )(studentCourses)

  // We do not actually remove the account, we soft delete it (to preserve for example game leaderboards)
  await removeStudentAccountSoftly(student.id)
}

const nextBatch = async (page, take) => (
  findOutdatedAccounts({ page: page + 1, take })
)

const nextBatchInactiveAccounts = async (page, take) => (
  findOutdatedNotUsedAccounts({ page: page + 1, take })
)

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  console.log(batch)

  return forEachP(removeStudent)(batch)
}

export const removeOutdatedAccounts = async () => {
  /**
   * Limit the batch daily so we don't overload the server
   */
  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH, 0, 3)
  await processInBatches(nextBatchInactiveAccounts, processBatch, RECORDS_PER_BATCH, 0, 3)
}
