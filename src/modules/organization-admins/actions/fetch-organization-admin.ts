import { findOneOrFail } from '../organization-admins-repository'

export default async (user, id: string) => (
  findOneOrFail({ id, organization_id: user.organization_id })
)
