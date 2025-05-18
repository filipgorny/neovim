const StudentBookContentComment = bookshelf => bookshelf.model('StudentBookContentComment', {
  tableName: 'student_book_content_comments',
  uuid: true,
})

export default StudentBookContentComment
