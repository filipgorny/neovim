const StudentNotification = bookshelf => bookshelf.model('StudentNotification', {
  tableName: 'student_notifications',
  uuid: true,

  notification () {
    return this.belongsTo('Notification', 'notification_id')
  },
})

export default StudentNotification
