import * as R from 'ramda'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const sortByWeekDays = R.sort(
  (a, b) => DAYS.indexOf(a.weekday) < DAYS.indexOf(b.weekday) ? -1 : 1
)
