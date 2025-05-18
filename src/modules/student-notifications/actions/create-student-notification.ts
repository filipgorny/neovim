import StudentNotificationDTO from '../dto/student-notification-dto'
import { create } from '../student-notifications-repository'

export default async (payload: StudentNotificationDTO) => (
  create(payload)
)
