const StudentBookContentFlashcard = bookshelf => bookshelf.model('StudentBookContentFlashcard', {
  tableName: 'student_book_content_flashcards',
  uuid: true,

  content () {
    return this.belongsTo('StudentBookContent', 'content_id', 'id')
  },

  activityTimers () {
    return this.hasMany('FlashcardActivityTimer', 'flashcard_id', 'id')
  },

  originalFlashcard () {
    return this.belongsTo('Flashcard', 'original_flashcard_id', 'id')
  },

  boxFlashcards () {
    return this.hasMany('StudentBoxFlashcard', 'student_flashcard_id', 'id')
  },

  archivedFlashcards () {
    return this.hasMany('StudentFlashcardArchive', 'student_flashcard_id', 'id')
  },
})

export default StudentBookContentFlashcard
