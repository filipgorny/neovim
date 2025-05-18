const Student = bookshelf => bookshelf.model('Student', {
  tableName: 'students',
  uuid: true,

  user () {
    return this.hasOne('User', 'email', 'email')
  },

  courses () {
    return this.hasMany('StudentCourse', 'student_id', 'id')
  },

  exams () {
    return this.hasMany('StudentExam', 'student_id', 'id')
  },

  courseExtentions () {
    return this.hasMany('CourseExtension', 'student_id', 'id')
  },

  aminoAcidGames () {
    return this.hasMany('AminoAcidGame', 'student_id', 'id')
  },

  saltyBucksDailyLogs () {
    return this.hasMany('SaltyBucksDailyLog', 'student_id', 'id')
  },

  saltyBucksLogs () {
    return this.hasMany('SaltyBucksLog', 'student_id', 'id')
  },

  examScores () {
    return this.hasMany('StudentExamScores', 'student_id', 'id')
  },

  notifications () {
    return this.hasMany('StudentNotification', 'student_id', 'id')
  },

  token () {
    return this.hasOne('StudentToken', 'student_id', 'id')
  },

  stopWatches () {
    return this.hasMany('Stopwatch', 'student_id', 'id')
  },

  books () {
    return this.hasMany('StudentBook', 'student_id', 'id')
  },

  completionMeters () {
    return this.hasMany('StudentCompletionMeter', 'student_id', 'id')
  },

  courseActivityTimers () {
    return this.hasMany('StudentCourseActivityTimer', 'student_id', 'id')
  },

  pinVariants () {
    return this.hasMany('StudentPinVariant', 'student_id', 'id')
  },

  videoRatings () {
    return this.hasMany('StudentVideoRating', 'student_id', 'id')
  },

  bookActivityTimers () {
    return this.hasMany('StudentBookActivityTimer', 'student_id', 'id')
  },

  bookContentsRead () {
    return this.hasMany('StudentBookContentsRead', 'student_id', 'id')
  },

  flashcardActivityTimers () {
    return this.hasMany('FlashcardActivityTimer', 'student_id', 'id')
  },

  bookChapterActivityTimers () {
    return this.hasMany('StudentBookChapterActivityTimer', 'student_id', 'id')
  },

  bookSubchapterNotes () {
    return this.hasMany('StudentBookSubchapterNote', 'student_id', 'id')
  },

  favouriteVideos () {
    return this.hasMany('StudentFavouriteVideo', 'student_id', 'id')
  },

  videoActivityTimers () {
    return this.hasMany('VideoActivityTimer', 'student_id', 'id')
  },

  tasks () {
    return this.hasMany('StudentTask', 'student_id', 'id')
  },
})

export default Student
