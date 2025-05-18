import { patchEntity } from '../favourite-videos-service'

export default async (id: string, payload: {}) => (
  patchEntity(id, payload)
)
