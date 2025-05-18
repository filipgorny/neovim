const bookContentImage = bookshelf => bookshelf.model('BookContentImage', {
  tableName: 'book_content_images',
  uuid: true,
})

export default bookContentImage
