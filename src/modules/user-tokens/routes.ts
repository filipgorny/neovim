import { customParam, user } from '@desmart/js-utils'
import { route } from '../../../utils/route/attach-route'
import authUserByToken from './actions/auth-user-by-token'
import getTokenByUser from './actions/get-token-by-user'
import refreshTokenByUser from './actions/refresh-token-by-user'
import refreshTokenByStudent from './actions/refresh-token-by-student'
import { authApiClient, authApiUser } from '../../middleware/authorize-api-client'
import { hideSensitiveData } from '../users/users-transformers'
import { authStudent } from '../../middleware/authorize'
import getTokenByStudent from './actions/get-token-by-student'

export default app => {
  app.get('/api/user-tokens', [authApiClient, authApiUser], route(getTokenByUser, [user]))

  app.post('/api/user-tokens/refresh-token', [authApiClient, authApiUser], route(refreshTokenByUser, [user]))
  app.post('/api/user-tokens/:token', authApiClient, route(authUserByToken, [customParam('token')], [hideSensitiveData]))

  app.get('/user-tokens', authStudent, route(getTokenByStudent, [user]))

  app.post('/user-tokens/refresh-token', authStudent, route(refreshTokenByStudent, [user]))
  app.post('/user-tokens/:token', authStudent, route(authUserByToken, [customParam('token')], [hideSensitiveData]))
}
