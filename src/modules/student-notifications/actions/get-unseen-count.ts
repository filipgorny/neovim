import { countUnseenNotifications } from '../student-notifications-repository'

export default async (student_id: string) => (
  countUnseenNotifications(student_id)
)
