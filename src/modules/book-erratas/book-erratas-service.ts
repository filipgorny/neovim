import { BookErrata, BookErrataDTO } from '../../types/book-errata'
import { create, patch, deleteRecord } from './book-erratas-repository'

export const createErrata = async (dto: BookErrataDTO): Promise<BookErrata> => (
  create(dto)
)

export const patchErrata = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)
