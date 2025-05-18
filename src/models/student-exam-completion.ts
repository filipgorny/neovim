const StudentExamCompletion = bookshelf => bookshelf.model('StudentExamCompletion', {
  tableName: 'student_exam_completions',
  uuid: true,

  studentExam () {
    return this.belongsTo('StudentExam', 'student_exam_id')
  },

  student () {
    return this.belongsTo('Student', 'student_id')
  },
})

export default StudentExamCompletion
