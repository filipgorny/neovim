import * as R from 'ramda'
import { findOneOrFail as findAdmin } from '../../admins/admin-repository'
import { fetchNotifications } from '../notifications-service'

export default async (admin, query) => {
  const profile = await findAdmin({ id: admin.id }, ['adminCourses.course'])

  const courseIds = R.pipe(
    R.pathOr([], ['adminCourses']),
    R.pluck('course'),
    R.pluck('id')
  )(profile)

  return fetchNotifications(query.limit, query.order, query.filter, courseIds)
}
