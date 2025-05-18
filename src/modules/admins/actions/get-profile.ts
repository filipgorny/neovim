import { findOneOrFail as findAdmin } from '../admin-repository'

export default async (user) => (
  findAdmin({ id: user.id }, ['bookAdminPermissions.book', 'adminCourses.course'])
)
