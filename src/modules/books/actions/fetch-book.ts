import R from 'ramda'
import { findOneOrFail } from '../book-repository'

export default async id => R.pipeWith(R.andThen)([
  async () => findOneOrFail({ id }, ['chapters.subchapters', 'chapters.attached.exam']),
  R.over(
    R.lensProp('chapters'),
    R.map(
      R.pipe(
        R.pick(['id', 'title', 'subchapters', 'attached']),
        // @ts-ignore
        R.over(
          // @ts-ignore
          R.lensProp('subchapters'),
          // @ts-ignore
          R.map(R.pick(['id', 'title']))
        )
      )
    )
  ),
])(true)
