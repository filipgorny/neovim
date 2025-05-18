import { DELETED_AT } from '../../utils/generics/repository'

const bookContentResource = bookshelf => bookshelf.model('BookContentResource', {
  tableName: 'book_content_resources',
  uuid: true,

  video () {
    return this.belongsTo('Video', 'external_id', 'id').query({ where: { [DELETED_AT]: null } })
  },

  content () {
    return this.belongsTo('BookContent', 'content_id')
  },
})

export default bookContentResource
