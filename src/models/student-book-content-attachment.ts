const StudentBookContentAttachment = bookshelf => bookshelf.model('StudentBookContentAttachment', {
  tableName: 'student_book_content_attachments',
  uuid: true,
})

export default StudentBookContentAttachment
