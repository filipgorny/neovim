const StudentBook = bookshelf => bookshelf.model('StudentBook', {
  tableName: 'student_books',
  uuid: true,

  book () {
    return this.belongsTo('Book', 'book_id')
  },

  chapters () {
    return this.hasMany('StudentBookChapter', 'book_id', 'id')
  },

  activityTimers () {
    return this.hasMany('StudentBookActivityTimer', 'student_book_id', 'id')
  },

  pinVariants () {
    return this.hasMany('StudentPinVariant', 'student_book_id', 'id')
  },

  reads () {
    return this.hasMany('StudentBookContentsRead', 'student_book_id', 'id')
  },

  flashcardActivityTimers () {
    return this.hasMany('FlashcardActivityTimer', 'student_book_id', 'id')
  },

  chapterActivityTimers () {
    return this.hasMany('StudentBookChapterActivityTimer', 'student_book_id', 'id')
  },

  course () {
    return this.belongsTo('StudentCourse', 'course_id')
  },

  flashcardBoxes () {
    return this.hasMany('StudentFlashcardBox', 'student_book_id', 'id')
  },
})

export default StudentBook
