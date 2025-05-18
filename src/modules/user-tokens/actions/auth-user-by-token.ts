import { authUserByToken } from '../user-tokens-service'

export default async (token: string) => (
  authUserByToken(token)
)
