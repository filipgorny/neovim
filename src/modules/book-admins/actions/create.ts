import { BookAdminDTO } from '../../../types/book-admin'
import { createEntity } from '../book-admins-service'

export default async (payload: BookAdminDTO) => (
  createEntity(payload)
)
