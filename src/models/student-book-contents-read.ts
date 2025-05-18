const StudentBookContentsRead = bookshelf => bookshelf.model('StudentBookContentsRead', {
  tableName: 'student_book_contents_read',
  uuid: true,
})

export default StudentBookContentsRead
