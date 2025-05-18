import { sendNotificationById } from '../notifications-service'

export default async (id: string): Promise<void> => (
  sendNotificationById(id)
)
