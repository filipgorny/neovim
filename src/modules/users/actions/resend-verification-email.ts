import { fetchFirst } from '../../../../utils/model/fetch'
import { User } from '../../../models'
import randomString from '../../../../utils/string/random-string'
import dispatchEmailVerificationNotification
  from '../../../../services/notification/dispatch-email-verification-notification'

const setNewVerificationToken = async (user, token) => (
  User.where({
    id: user.id,
  }).save({
    email_verification_token: token,
  }, { patch: true })
)

const resendVerificationEmail = async (id, payload) => {
  const user = await fetchFirst(User)({ id })
  const token = randomString()

  await setNewVerificationToken(user, token)

  return dispatchEmailVerificationNotification({
    // @ts-ignore
    email: user.email,
    email_verification_token: token,
  }, payload.link)
}

export default resendVerificationEmail
