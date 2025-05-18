const StudentFavouriteVideo = bookshelf => bookshelf.model('StudentFavouriteVideo', {
  tableName: 'student_favourite_videos',
  uuid: true,
})

export default StudentFavouriteVideo
