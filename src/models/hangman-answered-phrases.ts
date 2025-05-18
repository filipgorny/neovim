const HangmanAnsweredPhrase = bookshelf => bookshelf.model('HangmanAnsweredPhrases', {
  tableName: 'hangman_answered_phrases',
  uuid: true,
})

export default HangmanAnsweredPhrase
