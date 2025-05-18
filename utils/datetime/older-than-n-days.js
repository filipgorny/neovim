const R = require('ramda')
const moment = require('moment')

const olderThanNDays = R.curry(
  (n, pastDateString) => {
    const nDaysAgoTS = moment().subtract(n, 'days').valueOf()
    const pastDateTS = moment(pastDateString).valueOf()

    return pastDateTS < nDaysAgoTS
  }
)

module.exports = olderThanNDays
