import { OrganizationDTO } from '../../../types/organization'
import { createEntity } from '../organizations-service'

export default async (payload: OrganizationDTO) => (
  createEntity(payload)
)
