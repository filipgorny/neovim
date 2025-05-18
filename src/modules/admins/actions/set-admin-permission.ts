import { User } from '../../../types/user'
import { setGlobalPermission } from '../admin-service'

type Payload = {
  permission: string,
  is_enabled: boolean,
}

export default async (id: string, payload: Payload): Promise<User> => (
  setGlobalPermission(id, payload.permission, payload.is_enabled)
)
