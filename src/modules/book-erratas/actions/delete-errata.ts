import { deleteEntity } from '../book-erratas-service'

export default async (id: string) => (
  deleteEntity(id)
)
