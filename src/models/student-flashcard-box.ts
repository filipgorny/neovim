const StudentFlashcardBox = bookshelf => bookshelf.model('StudentFlashcardBox', {
  tableName: 'student_flashcard_boxes',
  uuid: true,
})

export default StudentFlashcardBox
