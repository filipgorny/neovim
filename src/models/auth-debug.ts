const AuthDebug = bookshelf => bookshelf.model('AuthDebug', {
  tableName: 'auth_debug',
  uuid: true,
})

export default AuthDebug
