const BookContentCourseTopic = bookshelf => bookshelf.model('BookContentCourseTopic', {
  tableName: 'book_content_course_topics',
  uuid: true,

  courseTopic () {
    return this.belongsTo('CourseTopic', 'course_topic_id')
  },

  bookContent () {
    return this.belongsTo('BookContent', 'book_content_id')
  },
})

export default BookContentCourseTopic
