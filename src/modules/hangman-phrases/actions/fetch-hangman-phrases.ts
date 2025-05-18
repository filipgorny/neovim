import * as R from 'ramda'
import { find } from '../hangman-phrases-repository'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

const defaultQuery = ({
  order: {
    by: 'phrase_raw',
    dir: 'asc',
  },
  limit: {
    page: 1,
    take: 10,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

export default async (query) => (
  R.pipeWith(R.andThen)([
    async () => find(prepareQuery(query), query.filter, ['hints']),
    R.over(R.lensProp('data'), R.pipe(
      collectionToJson,
      R.map(R.over(R.lensProp('image_hint'), generateStaticUrl)),
      R.map(R.over(R.lensProp('hints'), R.sortBy(R.prop('order'))))
    )),
  ])(true)
)
