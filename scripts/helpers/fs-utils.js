const fs = require('fs')

const writeArrayToFile = filePath => data => fs.writeFileSync(filePath, data.join('\n'))

const getFileContents = async filePath => (
  fs.readFileSync(filePath, { encoding: 'utf8' }).split('\n')
)

module.exports = {
  writeArrayToFile,
  getFileContents
}
