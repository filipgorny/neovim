import { lockBook } from '../book-service'

export default async (id: string, is_locked: string) => (
  lockBook(id, is_locked)
)
