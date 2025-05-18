import * as R from 'ramda'
import { findOneOrFail } from '../book-repository'

const fetchBook = async (id: string) => findOneOrFail({ id }, ['chapters.admins', 'chapters.subchapters'])

export default async (id: string) => {
  const book = await fetchBook(id)

  return R.pipe(
    R.prop('chapters'),
    R.map(
      R.mergeLeft({ is_locked: book.is_locked })
    )
  )(book)
}
