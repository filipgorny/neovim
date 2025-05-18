import { create, patch, findOne, deleteRecord } from './favourite-videos-repository'

export const createEntity = async (dto: {}) => (
  create(dto)
)

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)

export const markVideoAsFavourite = async (student_id: string, video_id: string) => {
  const record = await findOne({ student_id, video_id })

  return record ? deleteEntity(record.id) : createEntity({ student_id, video_id })
}
