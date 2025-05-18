import R from 'ramda'
import { DELETED_AT } from '../../../../utils/generics/repository'
import { findDeletedBooksByAdmin } from '../book-repository'

const defaultQuery = ({
  order: {
    by: DELETED_AT,
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

export default async (user, query) => (
  findDeletedBooksByAdmin(user, prepareQuery(query), query.filter)
)
