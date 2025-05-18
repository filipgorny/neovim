import { create } from './auth-debug-repository'

export const logAuthError = async (token: string) => (
  create({
    token,
  })
)
