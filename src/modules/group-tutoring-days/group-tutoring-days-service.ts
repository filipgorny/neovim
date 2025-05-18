import * as R from 'ramda'
import { create, patch, deleteRecord } from './group-tutoring-days-repository'

export const createEntity = async (dto: {}) => (
  create(dto)
)

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)

export const copyGroupTutoringDayForNewCourse = (newCourseId: string) => async (groupTutoringDay) => {
  const payload = {
    ...groupTutoringDay,
    course_id: newCourseId,
  }

  return create(
    R.omit(['id'])(payload)
  )
}
