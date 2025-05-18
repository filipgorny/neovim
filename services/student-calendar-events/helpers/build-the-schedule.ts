import { int } from '@desmart/js-utils'
import { Moment } from 'moment'

export const buildTheSchedule = (startDate: Moment, endDate: Moment) => {
  const schedule = []

  for (let i = 0; i < endDate.diff(startDate, 'days'); i++) {
    const currentDay = startDate.clone().add(i, 'days')

    schedule.push({
      thisDate: currentDay,
      dayOfWeek: int(currentDay.format('d')) + 1,
      tasks: [],
      onBreak: false,
    })
  }

  return schedule
}
