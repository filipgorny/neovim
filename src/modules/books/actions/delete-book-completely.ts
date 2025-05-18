import { deleteBookCompletely } from '../book-service'

export default async (id: string) => (
  deleteBookCompletely(id)
)
