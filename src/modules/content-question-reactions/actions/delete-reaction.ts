import { deleteEntity } from '../content-question-reactions-service'

export default async (id: string) => (
  deleteEntity(id)
)
