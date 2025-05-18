const ChatHistory = bookshelf => bookshelf.model('ChatHistory', {
  tableName: 'chat_history',
  uuid: true,
})

export default ChatHistory
