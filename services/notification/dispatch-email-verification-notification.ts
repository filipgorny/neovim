import * as R from 'ramda'
import * as notificationDispatcher from './notification-dispatcher'

const dispatchEmailVerificationNotification = async (instance, link) => (
  notificationDispatcher.verifyEmail({
    email: instance.email,
    link: R.replace('__id__', instance.id, link),
  })
)

export default dispatchEmailVerificationNotification
