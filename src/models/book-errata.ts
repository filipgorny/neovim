const BookErrata = bookshelf => bookshelf.model('BookErrata', {
  tableName: 'book_erratas',
  uuid: true,
})

export default BookErrata
