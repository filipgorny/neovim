import R from 'ramda'
import { fetchFirst } from '../../../../utils/model/fetch'
import { User } from '../../../models'
import issueAuthToken from '../../../../services/users/issue-auth-token'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/verify-user-schema'
import { throwException, notFoundException } from '../../../../utils/error/error-factory'

const activateAccount = async user => (
  User.where({
    id: user.id,
  }).save({
    is_email_verified: true,
    is_active: true,
    email_verification_token: null,
  }, { patch: true })
)

const verifyUser = async payload => {
  validateEntityPayload(schema)(payload)

  const user = await fetchFirst(User)({
    id: payload.id,
    email_verification_token: payload.token,
  })

  R.when(
    R.isNil,
    () => throwException(notFoundException('User'))
  )(user)

  await activateAccount(user)

  return {
    token: issueAuthToken(user)(),
  }
}

export default verifyUser
