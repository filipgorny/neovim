const PercentileRank = bookshelf => bookshelf.model('PercentileRank', {
  tableName: 'percentile_ranks',
  uuid: true,
})

export default PercentileRank
