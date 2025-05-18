const FlashcardActivityTimer = bookshelf => bookshelf.model('FlashcardActivityTimer', {
  tableName: 'flashcard_activity_timers',
  uuid: true,
})

export default FlashcardActivityTimer
