const s3File = bookshelf => bookshelf.model('s3File', {
  tableName: 's3_files',
  uuid: true,
})

export default s3File
