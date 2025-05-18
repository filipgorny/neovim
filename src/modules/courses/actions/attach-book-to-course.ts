import { attachOne } from '../../course-books/course-book-service'

export default async (id: string, book_id: string) => (
  attachOne(id, book_id)
)
