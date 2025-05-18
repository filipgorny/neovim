import { sendNotificationToStudent } from '../socket-servers-service'

export default (student_id: string): void => {
  sendNotificationToStudent(student_id)
}
