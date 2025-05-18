const StudentCalendarDaysOff = bookshelf => bookshelf.model('StudentCalendarDaysOff', {
  tableName: 'student_calendar_days_off',
  uuid: true,
})

export default StudentCalendarDaysOff
