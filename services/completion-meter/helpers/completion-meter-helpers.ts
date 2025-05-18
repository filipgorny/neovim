import * as R from 'ramda'
import { int } from '@desmart/js-utils'
import { findByName as findSettingByName } from '../../../src/modules/app-settings/app-settings-repository'
import { fetch } from '../../../utils/model/fetch'
import { StudentCourse } from '../../../src/models'
import { StudentCourseStatus } from '../../../src/modules/student-courses/student-course-status'
import { collectionToJson } from '../../../utils/model/collection-to-json'

export const getSettingValue = async (settingName: string) => (
  R.pipeWith(R.andThen)([
    findSettingByName,
    R.prop('value'),
    int,
  ])(settingName)
)

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

const fetchActiveStudentCourses = (batchNumber, step) => async () => (
  fetch(StudentCourse)({
    status: StudentCourseStatus.ongoing,
  }, ['exams', 'completionMeter'], buildPaginationData(batchNumber, step))
)

export const nextBatch = async (batchNumber, step) => (
  R.pipeWith(R.andThen)([
    fetchActiveStudentCourses(batchNumber, step),
    R.prop('data'),
    collectionToJson,
  ])(true)
)

export const debugLog = (msg, debugMode = false) => {
  if (debugMode) {
    console.log(msg)
  }
}

export const debugLogTap = (debugMode = false) => data => {
  if (debugMode) {
    console.log(data)
  }

  return data
}
