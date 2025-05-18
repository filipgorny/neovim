const StudentBookVideo = bookshelf => bookshelf.model('StudentBookVideo', {
  tableName: 'student_book_videos',
  uuid: true,
})

export default StudentBookVideo
