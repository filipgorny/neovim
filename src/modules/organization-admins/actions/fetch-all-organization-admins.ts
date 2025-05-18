import { find } from '../organization-admins-repository'

export default async (user, query) => (
  find(query, { organization_id: user.organization_id })
)
