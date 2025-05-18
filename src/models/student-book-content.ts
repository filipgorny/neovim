const StudentBookContent = bookshelf => bookshelf.model('StudentBookContent', {
  tableName: 'student_book_contents',
  uuid: true,

  resources () {
    return this.hasMany('StudentBookContentResource', 'content_id', 'id')
  },

  questions () {
    return this.hasMany('StudentBookContentQuestion', 'content_id', 'id')
  },

  images () {
    return this.hasMany('StudentBookContentImage', 'content_id', 'id')
  },

  attachments () {
    return this.hasMany('StudentBookContentAttachment', 'content_id', 'id')
  },

  flashcards () {
    return this.hasMany('StudentBookContentFlashcard', 'content_id', 'id')
  },

  subchapter () {
    return this.belongsTo('StudentBookSubchapter', 'subchapter_id', 'id')
  },

  originalContent () {
    return this.belongsTo('BookContent', 'original_content_id', 'id')
  },

  pinNotes () {
    return this.hasMany('StudentBookContentPin', 'content_id', 'id')
  },
})

export default StudentBookContent
