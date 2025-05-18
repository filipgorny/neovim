import R from 'ramda'
import { payload, route, query, id, user, payloadValidate } from '../../../utils/route/attach-route'
import { authMasterAdmin, authAdmin, allow, Role } from '../../middleware/authorize'
import adminLogIn from './actions/admin-log-in'
import createAdmin from './actions/create-admin'
import fetchAllAdmins from './actions/fetch-all-admins'
import fetchAdmin from './actions/fetch-admin'
import updateAdmin from './actions/update-admin'
import deleteAdmin from './actions/delete-admin'
import resetPasswordInit from '../admins/actions/reset-password-init'
import resetPasswordValidate from '../admins/actions/reset-password-validate'
import resetPasswordFinish from '../admins/actions/reset-password-finish'
import impersonateStudent from '../admins/actions/impersonate-student'
import bulkDeleteAdmins from './actions/bulk-delete-admins'
import verifyAdmin from './actions/verify-admin'
import { authApiClient } from '../../middleware/authorize-api-client'
import attachToBookChapter from './actions/attach-to-book-chapter'
import detachFromBookChapter from './actions/detach-from-book-chapter'
import attachManyBookChapters from './actions/attach-many-book-chapters'
import detachManyBookChapters from './actions/detach-many-book-chapters'
import setAdminPermission from './actions/set-admin-permission'
import getProfile from './actions/get-profile'

import { schema as attachManyBookChaptersSchema } from './validation/schema/attach-many-book-chapters-schema'
import { schema as updateAdminSchema } from './validation/schema/update-admin-schema'
import { schema as resetPasswordInitSchema } from './validation/schema/reset-password-init-schema'
import { schema as resetPasswordFinishSchema } from './validation/schema/reset-password-finish-schema'
import { schema as setAdminPermissionSchema } from './validation/schema/set-admin-permission-schema'

export default app => {
  app.post('/admins/login', route(adminLogIn, [payload]))
  app.post('/admins', authMasterAdmin, route(createAdmin, [payload]))
  app.post('/admins/reset-password-init', route(resetPasswordInit, [payloadValidate(resetPasswordInitSchema)]))
  app.post('/admins/reset-password-validate', route(resetPasswordValidate, [payload]))
  app.post('/admins/reset-password-finish', route(resetPasswordFinish, [payloadValidate(resetPasswordFinishSchema)]))
  app.post('/admins/impersonate/:id', allow(Role.igor, Role.retail), route(impersonateStudent, [user, id]))
  app.post('/admins/book-chapter/:id/attach', authMasterAdmin, route(attachToBookChapter, [id, payload]))
  app.post('/admins/:id/book-chapters/attach', allow(Role.igor), route(attachManyBookChapters, [id, payloadValidate(attachManyBookChaptersSchema)]))

  app.get('/admins/profile', authAdmin, route(getProfile, [user]))
  app.get('/admins', allow(Role.igor), route(fetchAllAdmins, [query]))
  app.get('/admins/:id', authMasterAdmin, route(fetchAdmin, [id]))
  app.get('/api/admins/verify', [authApiClient, authAdmin], route(verifyAdmin))

  app.patch('/admins/bulk', authMasterAdmin, route(bulkDeleteAdmins, [user, payload]))
  app.patch('/admins/:id', allow(Role.igor), route(updateAdmin, [id, user, payloadValidate(updateAdminSchema)]))
  app.patch('/admins/book-chapter/:id/detach', authMasterAdmin, route(detachFromBookChapter, [id, payload]))
  app.patch('/admins/:id/book-chapters/detach', allow(Role.igor), route(detachManyBookChapters, [id, payload]))
  app.patch('/admins/:id/permission', authMasterAdmin, route(setAdminPermission, [id, payloadValidate(setAdminPermissionSchema)]))

  // Probably not used anywhere - investigate in future
  app.delete('/admins/:id', authMasterAdmin, route(deleteAdmin, [id, user]))
}
