import R from 'ramda'
import { findOneOrFail } from '../admin-repository'

export default async (id: string) => (
  R.pipeWith(R.andThen)([
    async where => findOneOrFail(where, ['bookAdminPermissions.book', 'adminCourses.course']),
    R.omit([
      'password',
      'deleted_at',
      'password_reset_token',
      'password_reset_token_created_at',
    ]),
  ])({ id })
)
