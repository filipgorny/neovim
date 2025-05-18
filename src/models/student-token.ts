const StudentToken = bookshelf => bookshelf.model('StudentToken', {
  tableName: 'student_tokens',
  uuid: true,

  student () {
    return this.belongsTo('Student', 'student_id')
  },
})

export default StudentToken
