const StudentVideoRating = bookshelf => bookshelf.model('StudentVideoRating', {
  tableName: 'student_video_ratings',
  uuid: true,
})

export default StudentVideoRating
