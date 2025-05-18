const VideoActivityTimer = bookshelf => bookshelf.model('VideoActivityTimer', {
  tableName: 'video_activity_timers',
  uuid: true,
})

export default VideoActivityTimer
