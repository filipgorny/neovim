const StudentTask = bookshelf => bookshelf.model('StudentTask', {
  tableName: 'student_tasks',
  uuid: true,

  task () {
    return this.belongsTo('Task', 'task_id')
  },
})

export default StudentTask
