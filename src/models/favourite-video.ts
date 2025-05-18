const FavouriteVideo = bookshelf => bookshelf.model('FavouriteVideo', {
  tableName: 'favourite_videos',
  uuid: true,
})

export default FavouriteVideo
