import { toggleFreeTrialBook } from '../../course-books/course-book-service'

export default async (id: string, book_id: string) => (
  toggleFreeTrialBook(id, book_id)
)
