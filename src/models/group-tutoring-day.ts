const GroupTutoringDay = bookshelf => bookshelf.model('GroupTutoringDay', {
  tableName: 'group_tutoring_days',
  uuid: true,

  tutor () {
    return this.belongsTo('CourseTutor', 'course_tutor_id')
  },
})

export default GroupTutoringDay
