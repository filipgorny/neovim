import R from 'ramda'
import { findBooksByAdmin } from '../book-repository'

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
    { is_archived: true }
  )
)

export default async (user, query) => (
  findBooksByAdmin(user, prepareQuery(query), prepareFilter(query.filter))
)
