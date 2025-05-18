import { Book } from './book'
import { BookSubchapter } from './book-subchapter'

export type BookChapter = {
  id: string,
  title: string,
  book_id: string,
  order: number,
  subchapters?: BookSubchapter[],
  book?: Book
}
