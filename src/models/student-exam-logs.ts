const ExamLog = bookshelf => bookshelf.model('StudentExamLog', {
  tableName: 'student_exam_logs',
  uuid: true,

  admin () {
    return this.belongsTo('Admin', 'admin_id')
  }
})

export default ExamLog
