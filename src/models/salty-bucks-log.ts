const SaltyBucksLog = bookshelf => bookshelf.model('SaltyBucksLog', {
  tableName: 'salty_bucks_logs',
  uuid: true,
})

export default SaltyBucksLog
