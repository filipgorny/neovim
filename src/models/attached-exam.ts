const AttachedExam = bookshelf => bookshelf.model('AttachedExam', {
  tableName: 'attached_exams',
  uuid: true,

  exam () {
    return this.belongsTo('Exam', 'exam_id')
  },
})

export default AttachedExam
