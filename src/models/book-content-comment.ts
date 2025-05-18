const BookContentComment = bookshelf => bookshelf.model('BookContentComment', {
  tableName: 'book_content_comments',
  uuid: true,
})

export default BookContentComment
