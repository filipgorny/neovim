import { DELETED_AT } from '../../utils/generics/repository'

const Flashcard = bookshelf => bookshelf.model('Flashcard', {
  tableName: 'flashcards',
  uuid: true,

  contents () {
    return this.belongsToMany('BookContent', 'book_content_flashcards', 'flashcard_id', 'content_id').query({ where: { [DELETED_AT]: null } })
  },

  contentFlashcards () {
    return this.hasMany('BookContentFlashcard', 'flashcard_id')
  },
})

export default Flashcard
