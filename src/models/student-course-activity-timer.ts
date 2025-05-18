const StudentCourseActivityTimer = bookshelf => bookshelf.model('StudentCourseActivityTimer', {
  tableName: 'student_course_activity_timers',
  uuid: true,
})

export default StudentCourseActivityTimer
