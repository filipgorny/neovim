import { sendNotificationToStudents } from '../socket-servers-service'

export default (student_ids: string[]): void => {
  sendNotificationToStudents(student_ids)
}
