import { deleteEntity } from '../organization-admins-service'

export default async (id: string) => (
  deleteEntity(id)
)
