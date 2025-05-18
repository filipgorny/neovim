import R from 'ramda'
import { find } from '../course-repository'
import { findOne as findAdmin } from '../../admins/admin-repository'
import asAsync from '../../../../utils/function/as-async'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

const defaultQuery = ({
  order: {
    by: 'title',
    dir: 'asc',
  },
  limit: {
    page: 1,
    take: 1000,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

const filterByGivenAdmin = admin => R.map(
  R.over(
    R.lensProp('adminCourses'),
    R.map(
      R.pipe(
        R.prop('admin'),
        R.ifElse(
          adminEntity => adminEntity.id === admin.id,
          R.identity,
          R.always(null)
        )
      )
    )
  )
)

const transformResults = admin => R.pipe(
  R.prop('data'),
  collectionToJson,
  R.map(
    R.pick(['id', 'title', 'adminCourses', 'codename'])
  ),
  filterByGivenAdmin(admin)
)

export default async (admin_id: string) => {
  const admin = await findAdmin({ id: admin_id })

  return R.pipeWith(R.andThen)([
    asAsync(prepareQuery),
    async query => find(query, {}, ['adminCourses.admin']),
    transformResults(admin),
  ])(true)
}
