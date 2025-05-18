import { detachOne } from '../../course-books/course-book-service'

export default async (id: string, book_id: string) => (
  detachOne(id, book_id)
)
