import R from 'ramda'
import { findBooksByAdmin, findOne } from '../book-repository'
import { AdminRoleEnum } from '../../admins/admin-roles'

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

const isMasterAdmin = user => user.get('admin_role') === AdminRoleEnum.master_admin

export default async (user, query) => {
  const results = await findBooksByAdmin(user, prepareQuery(query), prepareFilter(query.filter))

  if (isMasterAdmin(user)) {
    return results
  }

  // Fetch detailed data for each book including relations
  const detailedBooks = await Promise.all(
    results.data.map(async (book) => {
      const detailedBook = await findOne({ id: book.id }, ['chapters.attached.exam', 'attached.exam'])
      return detailedBook
    })
  )

  // Return the results with updated data
  return {
    ...results,
    data: detailedBooks,
  }
}
