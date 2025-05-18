const VideoCategory = bookshelf => bookshelf.model('VideoCategory', {
  tableName: 'video_categories',
  uuid: true,

  course () {
    return this.belongsTo('Course', 'course_id')
  },

  endDate () {
    return this.belongsTo('CourseEndDate', 'end_date_id')
  },
})

export default VideoCategory
