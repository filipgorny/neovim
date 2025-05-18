import * as R from 'ramda'
import * as notificationDispatcher from '../../../services/notification/notification-dispatcher'

export const dispatchPasswordResetNotification = async (instance, link) => (
  notificationDispatcher.resetPasswordGamesUser({
    email: instance.email,
    link: R.replace('__id__', instance.id, link),
  })
)
