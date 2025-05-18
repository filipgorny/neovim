import * as R from 'ramda'
import { DATETIME_DATABASE_FORMAT } from '../../../constants'
import { ModifiedNotificationDTO } from '../dto/notification-dto'
import { createNotification } from '../notifications-service'
import moment from 'moment-timezone'
import { replaceTimeZoneFromUTCToDefault } from '../notification-transformers'

export default async (payload: ModifiedNotificationDTO) => {
  const notification = await createNotification({
    ...R.omit(['broken_scheduled_for'], payload),
    ...(payload.broken_scheduled_for ? { scheduled_for: replaceTimeZoneFromUTCToDefault(moment(payload.broken_scheduled_for)).format(DATETIME_DATABASE_FORMAT) } : {}),
  })

  return notification.toJSON()
}
