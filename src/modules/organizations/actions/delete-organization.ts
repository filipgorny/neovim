import { deleteEntity } from '../organizations-service'

export default async (id: string) => (
  deleteEntity(id)
)
