const AminoAcidGame = bookshelf => bookshelf.model('AminoAcidGame', {
  tableName: 'amino_acid_games',
  uuid: true,
})

export default AminoAcidGame
