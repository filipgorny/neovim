import * as R from 'ramda'
import { findStudentsV3 } from '../student-repository'
import { findOneOrFail as findAdmin } from '../../admins/admin-repository'

export default async (admin, query) => {
  const profile = await findAdmin({ id: admin.id }, ['adminCourses.course'])

  const courseIds = R.pipe(
    R.pathOr([], ['adminCourses']),
    R.pluck('course'),
    R.pluck('id')
  )(profile)

  return findStudentsV3(query, courseIds, profile.id)
}
