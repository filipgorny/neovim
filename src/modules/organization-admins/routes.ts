import { id, payload, payloadValidate, query, route, user } from '@desmart/js-utils'
import { authOrganizationAdmin, authOrganizationMasterAdmin, authOrganizationMasterAdminOrAdmin } from '../../middleware/authorize-organization-admin'
import { authMasterAdmin } from '../../middleware/authorize'
import Actions from './actions'
import Validation from './validation/schema'

export default app => {
  app.post('/organization-admins/login', route(Actions.logIn, [payload]))
  app.post('/organization-admins/master', authMasterAdmin, route(Actions.createOrganizationMasterAdmin, [payloadValidate(Validation.createOrganizationMasterAdmin)]))
  app.post('/organization-admins', authOrganizationMasterAdmin, route(Actions.createOrganizationAdmin, [user, payloadValidate(Validation.createOrganizationAdmin)]))
  app.post('/organization-admins/reset-password-init', route(Actions.resetPasswordInit, [payloadValidate(Validation.resetPasswordInit)]))
  app.post('/organization-admins/reset-password-validate', route(Actions.resetPasswordValidate, [payload]))
  app.post('/organization-admins/reset-password-finish', route(Actions.resetPasswordFinish, [payloadValidate(Validation.resetPasswordFinish)]))

  app.get('/organization-admins', authOrganizationMasterAdminOrAdmin, route(Actions.fetchAllOrganizationAdmins, [user, query]))
  app.get('/organization-admins/:id', authOrganizationMasterAdminOrAdmin, route(Actions.fetchOrganizationAdmin, [user, id]))
  app.get('/organization-admins/profile', authOrganizationAdmin, route(Actions.getProfile, [user]))

  app.delete('/organization-admins/:id', authMasterAdmin, route(Actions.deleteOrganizationAdmin, [id]))
}
