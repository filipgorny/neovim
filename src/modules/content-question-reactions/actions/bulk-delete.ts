import { deleteMany } from '../content-question-reactions-service'

export default async (payload: string[]) => (
  deleteMany(payload)
)
