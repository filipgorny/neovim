import { findOneOrFail } from '../notifications-repository'
import { prepareNotification } from '../notifications-service'

export default async (id: string) => {
  const notification = await findOneOrFail({ id })

  return prepareNotification(notification)
}
