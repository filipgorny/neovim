const StudentVideo = bookshelf => bookshelf.model('StudentVideo', {
  tableName: 'student_videos',
  uuid: true,
})

export default StudentVideo
