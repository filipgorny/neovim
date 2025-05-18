import R from 'ramda'
import moment from 'moment'

const olderThanNMinutes = R.curry(
  (n, pastDateString) => {
    const nMinutesAgoTS = moment().subtract(n, 'minutes').valueOf()
    const pastDateTS = moment(pastDateString).valueOf()

    return pastDateTS < nMinutesAgoTS
  }
)

export default olderThanNMinutes
