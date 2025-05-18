import { deleteBook } from '../book-service'

export default async (id: string) => (
  deleteBook(id)
)
