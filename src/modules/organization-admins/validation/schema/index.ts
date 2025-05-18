import { schema as createOrganizationMasterAdmin } from './create-organization-master-admin-schema'
import { schema as createOrganizationAdmin } from './create-organization-admin-schema'
import { schema as resetPasswordInit } from './reset-password-init-schema'
import { schema as resetPasswordFinish } from './reset-password-finish-schema'

export default {
  createOrganizationMasterAdmin,
  createOrganizationAdmin,
  resetPasswordInit,
  resetPasswordFinish,
}
