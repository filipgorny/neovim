const ScaledScore = bookshelf => bookshelf.model('ScaledScore', {
  tableName: 'scaled_scores',
  uuid: true,
})

export default ScaledScore
