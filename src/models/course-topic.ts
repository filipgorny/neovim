const CourseTopic = bookshelf => bookshelf.model('CourseTopic', {
  tableName: 'course_topics',
  uuid: true,

  contentTopics () {
    return this.hasMany('BookContentCourseTopic', 'course_topic_id', 'id')
  },
})

export default CourseTopic
