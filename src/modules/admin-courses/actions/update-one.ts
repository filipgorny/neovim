import { patchEntity } from '../admin-courses-service'

export default async (id: string, payload: {}) => (
  patchEntity(id, payload)
)
