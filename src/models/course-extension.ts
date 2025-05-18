const CourseExtension = bookshelf => bookshelf.model('CourseExtension', {
  tableName: 'course_extensions',
  uuid: true,
})

export default CourseExtension
