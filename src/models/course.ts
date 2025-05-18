const Course = bookshelf => bookshelf.model('Course', {
  tableName: 'courses',
  uuid: true,

  books () {
    return this.hasMany('Book', 'book_id')
      .through('CourseBook', 'id', 'course_id', 'book_id')
      .withPivot(['is_free_trial', 'free_trial_exam_id'])
  },

  courseBooks () {
    return this.hasMany('CourseBook', 'course_id')
  },

  attached () {
    return this.hasMany('AttachedExam', 'attached_id')
  },

  courseMap () {
    return this.hasMany('CourseMap', 'book_course_id')
  },

  courseTopics () {
    return this.hasMany('CourseTopic', 'course_id')
  },

  endDates () {
    return this.hasMany('CourseEndDate', 'course_id')
  },

  contentTopics () {
    return this.hasMany('BookContentCourseTopic', 'course_id')
  },

  studentCourses () {
    return this.hasMany('StudentCourse', 'book_course_id')
  },

  adminCourses () {
    return this.hasMany('AdminCourse', 'course_id')
  },
})

export default Course
