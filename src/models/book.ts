import { DELETED_AT } from '../../utils/generics/repository'

const Book = bookshelf => bookshelf.model('Book', {
  tableName: 'books',
  uuid: true,

  chapters () {
    return this.hasMany('BookChapter', 'book_id', 'id').query({ where: { [DELETED_AT]: null } })
  },

  deletedNotManuallyChapters () {
    return this.hasMany('BookChapter', 'book_id', 'id')
      .query(qb => qb.where({ was_manually_deleted: false }).whereNotNull(DELETED_AT))
  },

  allChapters () {
    return this.hasMany('BookChapter', 'book_id', 'id')
  },

  attached () {
    return this.hasOne('AttachedExam', 'attached_id')
  },
})

export default Book
