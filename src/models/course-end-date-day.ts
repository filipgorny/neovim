const CourseEndDateDay = bookshelf => bookshelf.model('CourseEndDateDay', {
  tableName: 'course_end_date_days',
  uuid: true,

  chapter () {
    return this.belongsTo('BookChapter', 'book_chapter_id')
  },

  exam () {
    return this.belongsTo('Exams', 'exam_id')
  },

  endDate () {
    return this.belongsTo('CourseEndDate', 'end_date_id')
  },

  tutor () {
    return this.belongsTo('CourseTutor', 'course_tutor_id')
  },
})

export default CourseEndDateDay
