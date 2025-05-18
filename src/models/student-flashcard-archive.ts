const FlashcardArchive = bookshelf => bookshelf.model('StudentFlashcardArchive', {
  tableName: 'student_flashcard_archive',
  uuid: true,
})

export default FlashcardArchive
