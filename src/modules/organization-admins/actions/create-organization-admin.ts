import { createAdmin } from '../organization-admins-service'

type Payload = {
  email: string
  first_name: string
  last_name: string
}

export default async (user, payload: Payload) => (
  createAdmin({ ...payload, organization_id: user.organization_id })
)
