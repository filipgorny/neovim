import { DELETED_AT } from '../../utils/generics/repository'
import { FETCHED, FETCHED_COLLECTION, SAVED } from './model-events'

const parseJson = (value) => value ? JSON.parse(value) : null

const bookContentAttachment = bookshelf => bookshelf.model('bookContentAttachment', {
  tableName: 'book_content_attachments',
  uuid: true,

  initialize () {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on(FETCHED, instance => {
      instance.set({
        delta_object: parseJson(instance.get('delta_object')),
      })
    })

    this.on(FETCHED_COLLECTION, instances => {
      instances.forEach(instance => instance.set({
        delta_object: parseJson(instance.get('delta_object')),
      }))
    })

    this.on(SAVED, instance => {
      instance.set({
        delta_object: parseJson(instance.get('delta_object')),
      })
    })
  },

  content () {
    return this.belongsTo('BookContent', 'content_id', 'id').query({ where: { [DELETED_AT]: null } })
  },
})

export default bookContentAttachment
