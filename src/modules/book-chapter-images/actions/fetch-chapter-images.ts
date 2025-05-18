import R from 'ramda'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { findOneOrFail } from '../../book-chapters/book-chapter-repository'

export default async (id) => R.pipeWith(R.andThen)([
  async () => findOneOrFail({ id }, ['images']),
  R.prop('images'),
  R.sortBy(R.prop('order')),
  R.map(
    R.evolve({
      image: generateStaticUrl,
      small_ver: generateStaticUrl,
    })
  ),
])(true)
