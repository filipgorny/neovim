import { archiveBook } from '../book-service'

export default async (id: string, is_archived: string) => (
  archiveBook(id, is_archived === 'true')
)
