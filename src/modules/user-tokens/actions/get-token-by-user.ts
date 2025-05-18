import { User } from '../../../types/user'
import { getTokenByUser } from '../user-tokens-service'

export default async (user: User) => (
  getTokenByUser(user)
)
