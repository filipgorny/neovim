const SaltyBucksDailyLog = bookshelf => bookshelf.model('SaltyBucksDailyLog', {
  tableName: 'salty_bucks_daily_log',
  uuid: true,

  student () {
    return this.belongsTo('Student', 'student_id')
  },
})

export default SaltyBucksDailyLog
