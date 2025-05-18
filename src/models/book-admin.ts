const BookAdmin = bookshelf => bookshelf.model('BookAdmin', {
  tableName: 'book_admins',
  uuid: true,

  book () {
    return this.hasOne('Book', 'id', 'book_id')
  },
})

export default BookAdmin
