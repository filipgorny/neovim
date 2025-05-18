const Task = bookshelf => bookshelf.model('Task', {
  tableName: 'tasks',
  uuid: true,

  studentTasks () {
    return this.hasMany('StudentTask', 'task_id')
  },
})

export default Task
