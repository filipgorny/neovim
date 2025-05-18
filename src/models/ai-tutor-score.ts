const AiTutorScore = bookshelf => bookshelf.model('AiTutorScore', {
  tableName: 'ai_tutor_scores',
  uuid: true,

  chapter () {
    return this.belongsTo('StudentBookChapter', 'student_book_chapter_id')
  },
})

export default AiTutorScore
