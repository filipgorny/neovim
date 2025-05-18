import R from 'ramda'
import { findBooks } from '../book-repository'

const defaultQuery = ({
  order: {
    by: 'created_at',
    dir: 'desc',
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

const prepareFilter = filter => (
  R.mergeRight(
    filter,
    { is_archived: false }
  )
)

export default async (query) => (
  findBooks(prepareQuery(query), prepareFilter(query.filter))
)
