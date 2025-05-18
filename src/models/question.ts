const Question = bookshelf => bookshelf.model('Question', {
  tableName: 'questions',
  uuid: true,

  contentQuestions () {
    return this.hasMany('BookContentQuestion', 'question_id', 'id')
  },
})

export default Question
