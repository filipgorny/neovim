import { pauseNotification } from '../notifications-repository'

export default async (id: string) => (
  pauseNotification(id)
)
