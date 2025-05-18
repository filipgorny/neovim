import { deleteEntity } from '../exam-erratas-service'

export default async (id: string) => (
  deleteEntity(id)
)
