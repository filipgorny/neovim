import { sendNotificationToAllStudents } from '../socket-servers-service'

export default (): void => {
  sendNotificationToAllStudents()
}
