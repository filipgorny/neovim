const StudentCalendarEvent = bookshelf => bookshelf.model('StudentCalendarEvent', {
  tableName: 'student_calendar_events',
  uuid: true,

  examByItem () {
    return this.hasOne('StudentExam', 'id', 'student_item_id')
  },

  exam () {
    return this.hasOne('StudentExam', 'id', 'student_exam_id')
  },
})

export default StudentCalendarEvent
