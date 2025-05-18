import { deleteEntity } from '../admin-courses-service'

export default async (id: string) => (
  deleteEntity(id)
)
