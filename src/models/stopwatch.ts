const Stopwatch = bookshelf => bookshelf.model('Stopwatch', {
  tableName: 'stopwatches',
  uuid: true,
})

export default Stopwatch
