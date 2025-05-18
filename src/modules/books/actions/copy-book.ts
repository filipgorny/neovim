import { copyBook } from '../../../../services/books/copy-book/copy-book'

export default async (book_id: string, admin) => (
  copyBook(book_id)
)
