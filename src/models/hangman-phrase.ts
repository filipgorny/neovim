const HangmanPhrase = bookshelf => bookshelf.model('HangmanPhrase', {
  tableName: 'hangman_phrases',
  uuid: true,

  hints () {
    return this.hasMany('HangmanHint', 'phrase_id')
  },
})

export default HangmanPhrase
