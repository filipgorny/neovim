import { create, patch, deleteRecord, findOne } from './admin-courses-repository'

export const toggleAdminCourse = async (course_id: string, admin_id: string) => {
  const existingEntity = await findOne({ course_id, admin_id })

  return existingEntity ? deleteEntity(existingEntity.id) : create({ course_id, admin_id })
}

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)
