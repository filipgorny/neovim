const CalendarChapter = bookshelf => bookshelf.model('CalendarChapter', {
  tableName: 'calendar_chapters',
  uuid: true,

  chapter () {
    return this.belongsTo('BookChapter', 'chapter_id')
  },
})

export default CalendarChapter
