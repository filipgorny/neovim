const AdminCourse = bookshelf => bookshelf.model('AdminCourse', {
  tableName: 'admin_courses',
  uuid: true,

  admin () {
    return this.belongsTo('Admin', 'admin_id')
  },

  course () {
    return this.belongsTo('Course', 'course_id')
  },
})

export default AdminCourse
