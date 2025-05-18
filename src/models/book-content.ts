import { DELETED_AT } from '../../utils/generics/repository'
import { BookContentResourceTypeEnum } from '../modules/book-content-resources/book-contennt-resource-types'
import { FETCHED, FETCHED_COLLECTION, SAVED } from './model-events'

const parseJson = (value) => {
  try {
    return value ? JSON.parse(value) : null
  } catch (err) {
    return value
  }
}

const BookContent = bookshelf => bookshelf.model('BookContent', {
  tableName: 'book_contents',
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

  subchapter () {
    return this.belongsTo('BookSubchapter', 'subchapter_id')
  },

  resources () {
    return this.hasMany('BookContentResource', 'content_id', 'id')
  },

  videoResources () {
    return this.hasMany('BookContentResource', 'content_id', 'id').query({ where: { type: BookContentResourceTypeEnum.video } })
  },

  questions () {
    return this.hasMany('BookContentQuestion', 'content_id', 'id')
  },

  images () {
    return this.hasMany('BookContentImage', 'content_id', 'id')
  },

  attachments () {
    return this.hasMany('bookContentAttachment', 'content_id', 'id')
  },

  contentFlashcards () {
    return this.hasMany('BookContentFlashcard', 'content_id', 'id')
  },

  flashcards () {
    return this.belongsToMany('Flashcard', 'book_content_flashcards', 'content_id', 'flashcard_id').query({ where: { [DELETED_AT]: null } })
  },

  archivedFlashcards () {
    return this.belongsToMany('Flashcard', 'book_content_flashcards', 'content_id', 'flashcard_id').query({ where: { is_archived: true } })
  },
})

export default BookContent
