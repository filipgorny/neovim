import R from 'ramda'
import { find } from '../book-subchapter-repository'

const defaultQuery = ({
  order: {
    by: 'order',
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

export default async (chapter_id, query) => (
  find(prepareQuery(query), { chapter_id })
)
