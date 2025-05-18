import { findOneOrFail } from '../book-repository'
import { reorderQuestionsByBook } from '../../../../services/book-content-questions/reorder-content-questions-in-a-book'

export default async (id: string) => {
  const book = await findOneOrFail({ id }, ['chapters.subchapters.contents.questions'])

  return reorderQuestionsByBook(book)
}
