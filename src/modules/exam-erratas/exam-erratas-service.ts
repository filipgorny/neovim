import { create, patch, deleteRecord } from './exam-erratas-repository'

export const createErrata = async (dto: {}) => (
  create(dto)
)

export const patchErrata = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)
