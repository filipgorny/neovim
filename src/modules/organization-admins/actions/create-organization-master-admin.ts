import { createMasterAdmin } from '../organization-admins-service'

type Payload = {
  organization_id: string
  email: string
  first_name: string
  last_name: string
}

export default async (payload: Payload) => (
  createMasterAdmin(payload)
)
