const StudentExamScores = bookshelf => bookshelf.model('StudentExamScores', {
  tableName: 'student_exam_scores',
  uuid: true,

  examType () {
    return this.belongsTo('ExamType', 'exam_type_id')
  },

  student () {
    return this.belongsTo('Student', 'student_id')
  },
})

export default StudentExamScores
