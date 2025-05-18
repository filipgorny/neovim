import { sendNotificationToStudents } from '../../socket-servers/socket-servers-service'
import { deleteWhere } from '../../student-notifications/student-notifications-repository'
import { getStudentIdsByNotification, patch } from '../notifications-repository'

export default async (id: string) => {
  const studentIds = await getStudentIdsByNotification(id)
  await deleteWhere({ notification_id: id })

  const result = await patch(id, { deleted_at: new Date() })

  sendNotificationToStudents(studentIds)

  return result
}
