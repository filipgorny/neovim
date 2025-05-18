const StudentCourseEndDateDay = bookshelf => bookshelf.model('StudentCourseEndDateDay', {
  tableName: 'student_course_end_date_days',
  uuid: true,

  endDateDay () {
    return this.belongsTo('CourseEndDateDay', 'course_end_date_days_id', 'id')
  },
})

export default StudentCourseEndDateDay
