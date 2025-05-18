const CourseEndDate = bookshelf => bookshelf.model('CourseEndDate', {
  tableName: 'course_end_dates',
  uuid: true,

  course () {
    return this.belongsTo('Course', 'course_id')
  },

  days () {
    return this.hasMany('CourseEndDateDay', 'end_date_id', 'id')
  },
})

export default CourseEndDate
