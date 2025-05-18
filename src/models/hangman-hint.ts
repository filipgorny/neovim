const HangmanHint = bookshelf => bookshelf.model('HangmanHint', {
  tableName: 'hangman_hints',
  uuid: true,
})

export default HangmanHint
