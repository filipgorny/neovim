const CourseBook = bookshelf => bookshelf.model('CourseBook', {
  tableName: 'course_books',

  book () {
    return this.belongsTo('Book', 'book_id')
  },

  course () {
    return this.belongsTo('Course', 'course_id')
  },

  exam () {
    return this.belongsTo('Exam', 'free_trial_exam_id')
  },
})

export default CourseBook
