import { unpauseNotification } from '../notifications-repository'

export default async (id: string) => (
  unpauseNotification(id)
)
