const StudentAttachedExam = bookshelf => bookshelf.model('StudentAttachedExam', {
  tableName: 'student_attached_exams',
  uuid: true,

  exam () {
    return this.belongsTo('StudentExam', 'exam_id')
  },
})

export default StudentAttachedExam
