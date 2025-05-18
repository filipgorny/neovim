import { findOneOrFail } from '../organization-admins-repository'

export default async (user) => (
  findOneOrFail({ id: user.id })
)
