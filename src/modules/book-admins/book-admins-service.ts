import { BookAdmin, BookAdminDTO } from '../../types/book-admin'
import { create, patch, deleteRecord, findOne, removeWhere } from './book-admins-repository'

export const createEntity = async (dto: BookAdminDTO): Promise<BookAdmin> => {
  const bookAdmin = await findOne(dto)

  return bookAdmin || create(dto)
}

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteEntity = async (id: string): Promise<void> => (
  deleteRecord(id)
)

export const removeBookAdminByBookId = async (bookId: string) => (
  removeWhere({ book_id: bookId })
)
