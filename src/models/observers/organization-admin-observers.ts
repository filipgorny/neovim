import * as notificationDispatcher from '../../../services/notification/notification-dispatcher'
import env from '../../../utils/env'

export const dispatchPasswordResetNotification = async (instance, token) => (
  notificationDispatcher.resetPassword({
    email: instance.email,
    link: `${env('ADMIN_URL')}/organization/reset-password/${instance.id}/${token}`,
  })
)
