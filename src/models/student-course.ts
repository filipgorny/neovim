const StudentCourse = bookshelf => bookshelf.model('StudentCourse', {
  tableName: 'student_courses',
  uuid: true,

  original () {
    return this.belongsTo('Course', 'book_course_id')
  },

  student () {
    return this.belongsTo('Student', 'student_id')
  },

  exams () {
    return this.hasMany('StudentExam', 'exam_id')
      .through('StudentAttachedExam', 'id', 'course_id', 'exam_id')
  },

  courseActivityTimers () {
    return this.hasMany('StudentCourseActivityTimer', 'student_course_id', 'id')
  },

  bookActivityTimers () {
    return this.hasMany('StudentBookActivityTimer', 'student_course_id', 'id')
  },

  flashcardActivityTimers () {
    return this.hasMany('FlashcardActivityTimer', 'student_course_id', 'id')
  },

  completionMeter () {
    return this.hasOne('StudentCompletionMeter', 'student_course_id', 'id')
  },

  chapterActivityTimers () {
    return this.hasMany('StudentBookChapterActivityTimer', 'student_course_id', 'id')
  },

  courseTopics () {
    return this.hasMany('StudentCourseTopic', 'student_course_id', 'id')
  },

  contentComments () {
    return this.hasMany('StudentBookContentComment', 'student_course_id')
  },

  archivedFlashcards () {
    return this.hasMany('StudentFlashcardArchive', 'student_course_id', 'id')
  },

  endDate () {
    return this.belongsTo('CourseEndDate', 'end_date_id')
  },

  mcatDate () {
    return this.belongsTo('McatDate', 'mcat_date_id')
  },
})

export default StudentCourse
