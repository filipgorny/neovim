import { patchEntity } from '../organizations-service'

export default async (id: string, payload: {}) => (
  patchEntity(id, payload)
)
