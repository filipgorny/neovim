import * as R from 'ramda'
import { route, payload, id, request, user, payloadValidate } from '../../../utils/route/attach-route'
import { authApiClient, authApiUser } from '../../middleware/authorize-api-client'
import createUser from './actions/create-user'
import userLogIn from './actions/user-log-in'
import verifyUser from './actions/verify-user'
import resendVerificationEmail from './actions/resend-verification-email'
import resetPasswordInit from './actions/reset-password-init'
import resetPasswordValidate from './actions/reset-password-validate'
import resetPasswordFinish from './actions/reset-password-finish'
import refreshToken from './actions/refresh-token'
import getProfile from './actions/get-profile'
import addUsername from './actions/add-username'
import purchaseGladiator from './actions/purchase-gladiator'
import changePassword from './actions/change-password'
import { getUserWithStudentData } from './actions/get-user-with-student-data'
import { hideSensitiveData } from './users-transformers'

import { schema as addUsernameSchema } from './validation/schema/add-username-schema'
import { schema as purchaseGladiatorSchema } from './validation/schema/purchase-gladiator-schema'
import { schema as changePasswordSchema } from './validation/schema/change-password-schema'

export default app => {
  app.post('/api/users', authApiClient, route(createUser, [payload]))
  app.post('/api/users/verify', authApiClient, route(verifyUser, [payload]))
  app.post('/api/users/login', authApiClient, route(userLogIn, [payload]))
  app.post('/api/users/:id/resend-verification-email', authApiClient, route(resendVerificationEmail, [id, payload]))
  app.post('/api/users/reset-password-init', authApiClient, route(resetPasswordInit, [payload]))
  app.post('/api/users/reset-password-validate', authApiClient, route(resetPasswordValidate, [payload]))
  app.post('/api/users/reset-password-finish', authApiClient, route(resetPasswordFinish, [payload]))
  app.post('/api/users/refresh-token', [authApiClient, authApiUser], route(refreshToken, [user]))

  app.get('/api/users/me', [authApiClient, authApiUser], route(getProfile, [user]))
  app.get('/api/users/:id/student-data', authApiClient, route(getUserWithStudentData, [id], [hideSensitiveData]))

  app.patch('/api/users/username', [authApiClient, authApiUser], route(addUsername, [user, payloadValidate(addUsernameSchema)], [hideSensitiveData]))

  app.patch('/api/users/purchase-gladiator', [authApiClient, authApiUser], route(purchaseGladiator, [user, payloadValidate(purchaseGladiatorSchema)]))
  app.patch('/api/users/password', [authApiClient, authApiUser], route(changePassword, [user, payloadValidate(changePasswordSchema)]))
}
