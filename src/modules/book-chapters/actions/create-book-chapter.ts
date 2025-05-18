import R from 'ramda'
import { createChapter } from '../../book-chapters/book-chapter-service'
import { findOneOrFail } from '../../books/book-repository'
import { Book } from '../../../types/book'

type Payload = {
  bookId: string,
  title: string,
  order?: number,
}

const getNextChapterOrderFromBook = (book: Book) => (
  R.pipe(
    R.prop('chapters'),
    R.length,
    R.inc
  )(book)
)

const getChapterOrder = (book: Book, order: number) => (
  order || getNextChapterOrderFromBook(book)
)

const createBookChapter = async payload => {
  const book = await findOneOrFail({ id: payload.bookId }, ['chapters'])

  return createChapter(
    payload.title,
    getChapterOrder(book, payload.order),
    book.id,
    payload.order
  )
}

export default async (payload: Payload) => (
  createBookChapter(payload)
)
