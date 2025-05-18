const StudentBookChapterActivityTimer = bookshelf => bookshelf.model('StudentBookChapterActivityTimer', {
  tableName: 'student_book_chapter_activity_timers',
  uuid: true,
})

export default StudentBookChapterActivityTimer
