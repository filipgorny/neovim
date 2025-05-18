const ChatChapterScore = bookshelf => bookshelf.model('ChatChapterScore', {
  tableName: 'chat_chapter_scores',
  uuid: true,
})

export default ChatChapterScore
