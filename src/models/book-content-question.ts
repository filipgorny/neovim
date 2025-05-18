const BookContentQuestion = bookshelf => bookshelf.model('BookContentQuestion', {
  tableName: 'book_content_questions',
  uuid: true,

  question () {
    return this.belongsTo('Question', 'question_id')
  },

  content () {
    return this.belongsTo('BookContent', 'content_id')
  },
})

export default BookContentQuestion
