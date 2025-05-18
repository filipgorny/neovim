const HangmanGame = bookshelf => bookshelf.model('HangmanGame', {
  tableName: 'hangman_games',
  uuid: true,
})

export default HangmanGame
