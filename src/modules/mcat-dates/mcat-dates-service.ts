import * as R from 'ramda'
import { resourceAlreadyExistsException, throwException } from '@desmart/js-utils'
import { create, patch, findOne } from './mcat-dates-repository'

export const createMcatDate = async (dto: {}) => {
  const entity = await findOne(dto)

  if (entity) {
    throwException(resourceAlreadyExistsException('MCAT-date'))
  }

  return create(dto)
}

export const patchMcatDate = async (id: string, dto: {}) => {
  const entity = await findOne(dto)

  if (entity && entity.id !== id) {
    throwException(resourceAlreadyExistsException('MCAT-date'))
  }

  return patch(id, dto)
}

export const deleteEntity = async (id: string) => (
  patch(id, { deleted_at: new Date() })
)

export const copyMcatDateForNewCourse = (newCourseId: string) => async (mcatDate) => {
  const newMcatDate = {
    ...mcatDate,
    course_id: newCourseId,
  }

  return create(
    R.omit(['id'])(newMcatDate)
  )
}
