import moment from 'moment'

export const isWeekend = date => {
  const day = moment(date).day()

  return [0, 5, 6].includes(day)
}

export const isFriday = date => {
  const day = moment(date).day()

  return day === 5
}

export const isSaturday = date => {
  const day = moment(date).day()

  return day === 6
}
