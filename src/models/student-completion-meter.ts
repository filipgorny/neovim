const StudentCompletionMeter = bookshelf => bookshelf.model('StudentCompletionMeter', {
  tableName: 'student_completion_meters',
  uuid: true,
})

export default StudentCompletionMeter
