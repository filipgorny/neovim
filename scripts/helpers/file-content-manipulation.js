const R = require('ramda')

const injectBefore = (separator, string, customOffset = 0) => fileContentns => {
  const mapIndexed = R.addIndex(R.map)
  let atIndex = 0

  mapIndexed(
    (line, i) => {
      if (line.includes(separator)) {
        atIndex = i
      }
    }
  )(fileContentns)

  return R.insert(atIndex + customOffset, string, fileContentns)
}

const replacePlaceholder = (placeholder, string) => R.map(
  R.replace(new RegExp(placeholder, 'g'), string)
)

module.exports = {
  injectBefore,
  replacePlaceholder
}
