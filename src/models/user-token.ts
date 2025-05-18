const UserToken = bookshelf => bookshelf.model('UserToken', {
  tableName: 'user_tokens',
  uuid: true,

  user () {
    return this.belongsTo('User', 'user_id')
  },
})

export default UserToken
