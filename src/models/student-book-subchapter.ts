const StudentBookSubchapter = bookshelf => bookshelf.model('StudentBookSubchapter', {
  tableName: 'student_book_subchapters',
  uuid: true,

  contents () {
    return this.hasMany('StudentBookContent', 'subchapter_id', 'id')
  },

  notes () {
    return this.hasMany('StudentBookSubchapterNote', 'subchapter_id', 'id')
  },

  chapter () {
    return this.belongsTo('StudentBookChapter', 'chapter_id', 'id')
  },
})

export default StudentBookSubchapter
