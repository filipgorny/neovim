import { patchEntity } from '../organization-admins-service'

export default async (id: string, payload: {}) => (
  patchEntity(id, payload)
)
