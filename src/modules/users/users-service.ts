import * as R from 'ramda'
import { findOne, patch } from './users-repository'
import hashString from '../../../utils/hashing/hash-string'
import { UserRoleEnum } from './user-roles'
import { cannotPromoteUserException, throwException } from '../../../utils/error/error-factory'

export const findUserWithStudentData = async (user_id: string) => (
  findOne({ id: user_id }, ['student'])
)

export const changePassword = async (user, password: string) => (
  patch(user.id, {
    password: hashString(password),
  })
)

export const findUserByEmail = async (email: string) => (
  findOne({ email })
)

export const promoteToPatrician = async (user_id: string) => {
  const user = await findOne({ id: user_id })

  if (user.user_role === UserRoleEnum.libertus || user.user_role === UserRoleEnum.plebeian) {
    return becomePatrician(user_id)
  }
}

export const promoteToPlebeian = async (user_id: string) => {
  const user = await findOne({ id: user_id })

  if (user.user_role === UserRoleEnum.libertus) {
    return becomePlebeian(user_id)
  }
}

export const becomePatrician = async (user_id: string) => (
  patch(user_id, { user_role: UserRoleEnum.patrician })
)

export const becomePlebeian = async (user_id: string) => (
  patch(user_id, { user_role: UserRoleEnum.plebeian })
)
