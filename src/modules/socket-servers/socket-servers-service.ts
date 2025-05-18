import { socket } from '../../sockets/socket-client'

export const sendNotificationToStudents = (student_ids: string[]): void => {
  console.log('Sending socket event notification to some students')
  socket.emit('notification', { student_ids })
}

export const sendNotificationToAllStudents = (): void => {
  console.log('Sending socket event notification to all students')
  socket.emit('notification-to-all')
}

export const sendNotificationToStudent = (student_id: string): void => {
  sendNotificationToStudents([student_id])
}
