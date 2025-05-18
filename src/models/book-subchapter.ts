import { DELETED_AT } from '../../utils/generics/repository'

const BookSubchapter = bookshelf => bookshelf.model('BookSubchapter', {
  tableName: 'book_subchapters',
  hasTimestamps: true,
  uuid: true,

  chapter () {
    return this.belongsTo('BookChapter', 'chapter_id')
  },

  contents () {
    return this.hasMany('BookContent', 'subchapter_id', 'id').query({ where: { [DELETED_AT]: null } })
  },

  allContents () {
    return this.hasMany('BookContent', 'subchapter_id', 'id')
  },

  deletedNotManuallyBookContents () {
    return this.hasMany('BookContent', 'subchapter_id', 'id')
      .query(qb => qb.where({ was_manually_deleted: false }).whereNotNull(DELETED_AT))
  },
})

export default BookSubchapter
