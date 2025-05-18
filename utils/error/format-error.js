module.exports = error => ({
  name: error.name,
  code: error.statusCode,
  message: error.message
})
