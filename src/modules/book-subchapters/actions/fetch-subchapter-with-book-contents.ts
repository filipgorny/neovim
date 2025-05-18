import * as R from 'ramda'
import { findOneOrFail } from '../book-subchapter-repository'

export default async (id: string) => {
  const subchapter = await findOneOrFail({ id }, ['contents'])

  return {
    ...subchapter,
    contents: R.sortBy(R.prop('order'))(subchapter.contents),
  }
}
