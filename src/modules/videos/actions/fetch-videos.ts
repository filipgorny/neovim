import R from 'ramda'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import getVimeoStaticLink from '../../../../services/vimeo/get-vimeo-static-link'
import { findVideos } from '../video-repository'

const defaultQuery = ({
  limit: {
    page: 1,
    take: 16,
  },
  order: {
    by: 'title',
    dir: 'asc',
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

export default async (query, user) => R.pipeWith(R.andThen)([
  async () => findVideos(prepareQuery(query), query.filter, user),
  R.over(
    R.lensProp('data'),
    R.map(
      R.evolve({
        thumbnail: value => value ? generateStaticUrl(value) : null,
        source: value => value ? getVimeoStaticLink(value) : null,
      })
    )
  ),
])(true)
