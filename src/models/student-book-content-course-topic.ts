const StudentBookContentCourseTopic = bookshelf => bookshelf.model('StudentBookContentCourseTopic', {
  tableName: 'student_book_content_course_topics',
  uuid: true,

  studentCourseTopic () {
    return this.belongsTo('StudentCourseTopic', 'student_course_topic_id')
  },

  studentBookContent () {
    return this.belongsTo('StudentBookContent', 'student_book_content_id')
  },
})

export default StudentBookContentCourseTopic
