import { DELETED_AT } from '../../utils/generics/repository'

const BookChapter = bookshelf => bookshelf.model('BookChapter', {
  tableName: 'book_chapters',
  uuid: true,

  book () {
    return this.belongsTo('Book', 'book_id')
  },

  subchapters () {
    return this.hasMany('BookSubchapter', 'chapter_id', 'id').query({ where: { [DELETED_AT]: null } })
  },

  deletedNotManuallySubchapters () {
    return this.hasMany('BookSubchapter', 'chapter_id', 'id')
      .query(qb => qb.where({ was_manually_deleted: false }).whereNotNull(DELETED_AT))
  },

  allSubchapters () {
    return this.hasMany('BookSubchapter', 'chapter_id', 'id')
  },

  attached () {
    return this.hasOne('AttachedExam', 'attached_id')
  },

  admins () {
    return this.hasMany('Admin', 'admin_id')
      .through('ChapterAdmin', 'id', 'chapter_id', 'admin_id')
  },

  images () {
    return this.hasMany('BookChapterImage', 'chapter_id', 'id')
  },
})

export default BookChapter
