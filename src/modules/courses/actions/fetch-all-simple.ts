import R from 'ramda'
import { find } from '../course-repository'
import asAsync from '../../../../utils/function/as-async'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

const defaultQuery = ({
  order: {
    by: 'title',
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

const transformResults = R.pipe(
  R.prop('data'),
  collectionToJson,
  R.map(
    R.pick(['id', 'title'])
  )
)

export default async () => R.pipeWith(R.andThen)([
  asAsync(prepareQuery),
  async query => find(query, {}),
  transformResults,
])(true)
