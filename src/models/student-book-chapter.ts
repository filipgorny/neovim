const StudentBookChapter = bookshelf => bookshelf.model('StudentBookChapter', {
  tableName: 'student_book_chapters',
  uuid: true,

  subchapters () {
    return this.hasMany('StudentBookSubchapter', 'chapter_id', 'id')
  },

  book () {
    return this.belongsTo('StudentBook', 'book_id')
  },

  bookmark () {
    return this.belongsTo('StudentBookContent', 'bookmark_id')
  },

  chatScore () {
    return this.hasOne('ChatChapterScore', 'student_book_chapter_id')
  },

  chapterImages () {
    return this.hasMany('StudentBookChapterImage', 'chapter_id', 'id')
  },

  chapterActivityTimers () {
    return this.hasMany('StudentBookChapterActivityTimer', 'student_book_chapter_id', 'id')
  },
})

export default StudentBookChapter
