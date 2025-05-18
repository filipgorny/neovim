const BookChapterImage = bookshelf => bookshelf.model('BookChapterImage', {
  tableName: 'book_chapter_images',
  uuid: true,
})

export default BookChapterImage
