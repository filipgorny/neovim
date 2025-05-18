import { deleteEntity } from '../group-tutoring-days-service'

export default async (id: string) => (
  deleteEntity(id)
)
