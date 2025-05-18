const BookContentFlashcard = bookshelf => bookshelf.model('BookContentFlashcard', {
  tableName: 'book_content_flashcards',
  uuid: false,

  content () {
    return this.belongsTo('BookContent', 'content_id')
  },

  flashcard () {
    return this.belongsTo('Flashcard', 'flashcard_id')
  },
})

export default BookContentFlashcard
