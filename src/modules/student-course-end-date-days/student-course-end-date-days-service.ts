import * as R from 'ramda'
import mapP from '@desmart/js-utils/dist/function/mapp'
import { create, patch, deleteWhere, deleteRecord } from './student-course-end-date-days-repository'
import { find as findCourseEndDateDays } from '../course-end-date-days/course_end_date_days-repository'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { StudentCourse } from '../../types/student-course'

export const createEntity = async (dto: {}) => (
  create(dto)
)

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const copyCourseEndDateDays = async (studentCourse: StudentCourse) => {
  await deleteWhere({ student_course_id: studentCourse.id })

  return R.pipeWith(R.andThen)([
    async studentCourse => findCourseEndDateDays({ limit: { page: 1, take: 100 }, order: { by: 'class_date', dir: 'asc' } }, { end_date_id: studentCourse.end_date_id }),
    R.prop('data'),
    collectionToJson,
    mapP(
      async endDateDay => createEntity({
        student_course_id: studentCourse.id,
        course_end_date_days_id: endDateDay.id,
      })
    ),
  ])(studentCourse)
}

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)
