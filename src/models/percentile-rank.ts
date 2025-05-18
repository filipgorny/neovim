const PercentileRank = bookshelf => bookshelf.model('PercentileRank', {
  tableName: 'percentile_rank',
  uuid: true,
})

export default PercentileRank
