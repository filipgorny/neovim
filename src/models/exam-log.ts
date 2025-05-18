const ExamLog = bookshelf => bookshelf.model('ExamLog', {
  tableName: 'exam_logs',
  uuid: true,

  admin () {
    return this.belongsTo('Admin', 'admin_id')
  }
})

export default ExamLog
