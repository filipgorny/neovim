const RespirationGame = bookshelf => bookshelf.model('RespirationGame', {
  tableName: 'respiration_games',
  uuid: true,
})

export default RespirationGame
