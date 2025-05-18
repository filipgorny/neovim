import { deleteEntity } from '../book-admins-service'

export default async (id: string) => (
  deleteEntity(id)
)
