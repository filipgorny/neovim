const StudentCourseTopic = bookshelf => bookshelf.model('StudentCourseTopic', {
  tableName: 'student_course_topics',
  uuid: true,

  bookContentCourseTopics () {
    return this.hasMany('StudentBookContentCourseTopic', 'student_course_topic_id', 'id')
  },

  courseTopic () {
    return this.belongsTo('CourseTopic', 'original_course_topic_id', 'id')
  },
})

export default StudentCourseTopic
