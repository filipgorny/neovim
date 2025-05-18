const StudentBookContentPin = bookshelf => bookshelf.model('StudentBookContentPin', {
  tableName: 'student_book_content_pins',
  uuid: true,

  content () {
    return this.belongsTo('StudentBookContent', 'content_id', 'id')
  },

  pinVariant () {
    return this.hasOne('StudentPinVariant', 'variant', 'variant')
  },
})

export default StudentBookContentPin
