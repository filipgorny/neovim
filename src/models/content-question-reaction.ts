const ContentQuestionReaction = bookshelf => bookshelf.model('ContentQuestionReaction', {
  tableName: 'content_question_reactions',
  uuid: true,
})

export default ContentQuestionReaction
