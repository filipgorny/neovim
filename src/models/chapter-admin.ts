const ChapterAdmin = bookshelf => bookshelf.model('ChapterAdmin', {
  tableName: 'chapter_admins',

  book () {
    return this.belongsTo('Book', 'book_id')
  },
})

export default ChapterAdmin
