const StudentBookContentQuestion = bookshelf => bookshelf.model('StudentBookContentQuestion', {
  tableName: 'student_book_content_questions',
  uuid: true,

  content () {
    return this.belongsTo('StudentBookContent', 'content_id', 'id')
  },

  originalQuestion () {
    return this.belongsTo('Question', 'original_content_question_id')
  },
})

export default StudentBookContentQuestion
