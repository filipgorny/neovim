const CourseTutor = bookshelf => bookshelf.model('CourseTutor', {
  tableName: 'course_tutors',
  uuid: true,
})

export default CourseTutor
