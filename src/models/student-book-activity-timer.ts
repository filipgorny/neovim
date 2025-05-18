const StudentBookActivityTimer = bookshelf => bookshelf.model('StudentBookActivityTimer', {
  tableName: 'student_book_activity_timers',
  uuid: true,
})

export default StudentBookActivityTimer
