const StudentExamSection = bookshelf => bookshelf.model('StudentExamSection', {
  tableName: 'student_exam_sections',
  uuid: true,

  passages () {
    return this.hasMany('StudentExamPassage', 'student_section_id', 'id')
  },

  exam () {
    return this.belongsTo('StudentExam', 'student_exam_id')
  },
})

export default StudentExamSection
