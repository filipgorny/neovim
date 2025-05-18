const StudentBookContentResource = bookshelf => bookshelf.model('StudentBookContentResource', {
  tableName: 'student_book_content_resources',
  uuid: true,

  video () {
    return this.belongsTo('Video', 'external_id', 'id')
  },

  originalResource () {
    return this.belongsTo('BookContentResource', 'original_resource_id', 'id')
  },

  content () {
    return this.belongsTo('StudentBookContent', 'content_id', 'id')
  },

  videoActivityTimers () {
    return this.hasMany('VideoActivityTimer', 'video_id', 'id')
  },
})

export default StudentBookContentResource
