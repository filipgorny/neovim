const McatDate = bookshelf => bookshelf.model('McatDate', {
  tableName: 'mcat_dates',
  uuid: true,
})

export default McatDate
