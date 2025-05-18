import R from 'ramda'
import { updateAdmin } from '../admin-service'
import { AdminRole, AdminRoleEnum } from '../admin-roles'
import { throwException, unauthorizedException } from '../../../../utils/error/error-factory'

type Payload = {
  email: string,
  is_active: boolean,
  admin_role: AdminRole,
  name?: string
}

const validateAdminIsMasterAdmin = (user, payload: Payload) => () => {
  if (user.get('admin_role') !== AdminRoleEnum.master_admin) {
    throwException(unauthorizedException())
  }

  return payload
}

const validateUserChangingRole = (user) => (payload: Payload) => (
  R.pipe(
    R.prop('admin_role'),
    R.ifElse(
      R.includes(R.__, [AdminRoleEnum.master_admin, AdminRoleEnum.igor]),
      validateAdminIsMasterAdmin(user, payload),
      R.always(payload)
    )
  )(payload)
)

export default async (id: string, user, payload: Payload) => (
  R.pipe(
    validateUserChangingRole(user),
    updateAdmin(id)
  )(payload)
)
