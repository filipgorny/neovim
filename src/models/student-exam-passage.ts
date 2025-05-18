const StudentExamPassage = bookshelf => bookshelf.model('StudentExamPassage', {
  tableName: 'student_exam_passages',
  uuid: true,

  questions () {
    return this.hasMany('StudentExamQuestion', 'student_passage_id', 'id')
  },

  section () {
    return this.belongsTo('StudentExamSection', 'student_section_id')
  },

  originalPassage () {
    return this.belongsTo('ExamPassage', 'original_exam_passage_id')
  },
})

export default StudentExamPassage
