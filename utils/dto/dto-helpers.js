const R = require('ramda')

const toArray = function () {
  return Object.values(this.props)
}

const validate = function () {
  R.when(
    R.any(R.isNil),
    () => {
      throw new Error(`DTO invalid: ${this.toArray()}`)
    }
  )(this.toArray())
}

module.exports = {
  toArray,
  validate
}
