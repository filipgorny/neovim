import { create, update, patch, findOne } from './admin-repository'
import { makeDTO, AdminDTO } from './dto/admin-dto'
import { AdminRoleEnum } from './admin-roles'
import { validateAdminAlreadyExists } from './validation/validate-admin-already-exists'
import { adminAccountCreated } from '../../../services/notification/notification-dispatcher'
import env from '../../../utils/env'
import { Admin } from '../../models'
import randomString from '../../../utils/string/random-string'
import { AdminGlobalPermissionsEnum } from './admin-global-permissions'
import { customException, throwException } from '@desmart/js-utils'

const setNewPasswordResetToken = async (user, token) => (
  Admin.where({
    id: user.id,
  }).save({
    password_reset_token: token,
    password_reset_token_created_at: new Date(),
  }, { patch: true })
)

export const createMasterAdmin = async (email: string, password: string) => (
  create(
    makeDTO(email, password, AdminRoleEnum.master_admin, '')
  )
)

export const createEmployee = async (email: string, password: string, name?: string) => {
  await validateAdminAlreadyExists({ email })

  const user = await create(
    makeDTO(email, password, AdminRoleEnum.employee, name)
  )

  const token = randomString()

  await setNewPasswordResetToken(user, token)

  await adminAccountCreated({
    email,
    link: `${env('ADMIN_URL')}/reset-password/${user.id}/${token}`,
  })

  return user
}

export const updateAdmin = (id: string) => async (dto: AdminDTO) => (
  update(id, dto)
)

export const deleteAdmin = async (id: string) => {
  const entity = await findOne({ id })

  return patch(id, {
    deleted_at: new Date(),
    email: `${entity.email}-deleted-${randomString()}`,
  })
}

const validatePermission = (permission: string) => (
  AdminGlobalPermissionsEnum[permission] || throwException(customException('admins.invalid-permission', 422, 'Invalid permission'))
)

export const setGlobalPermission = async (id: string, permission: string, is_enabled: boolean) => (
  patch(id, {
    [validatePermission(permission)]: is_enabled,
  })
)
