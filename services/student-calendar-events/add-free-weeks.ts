import * as R from 'ramda'
import { Moment } from 'moment'

const moveSecondHalfOfEvents = (events: Moment[]) => {
  const half = Math.floor(events.length / 2)

  for (let i = 0; i < events.length; i++) {
    if (i >= half) {
      events[i] = events[i].add(7, 'days')
    }
  }

  return events
}

export const addFreeWeeksToMomentDates = (events: Moment[], freeWeeksAmount: number, maxDate: Moment) => {
  let movedEvents = events

  for (let i = 0; i < freeWeeksAmount; i++) {
    // if the last date is less than 7 days from exam_at, stop adding weeks
    if (movedEvents[movedEvents.length - 1].clone().add(7, 'days').isAfter(maxDate)) {
      return movedEvents
    }

    const grouped = R.groupBy(
      event => event.isoWeek()
    )(movedEvents)

    const splitEvents = R.splitAt(i + 1, R.values(grouped))

    const moved = R.pipe(
      R.flatten,
      R.map(
        event => {
          event = event.add(7, 'days')

          return event
        }
      )
    )(splitEvents[1])

    const movedInSecondIteration = R.pipe(
      R.last,
      moveSecondHalfOfEvents
    )(splitEvents[0])

    splitEvents[0][splitEvents[0].length - 1] = movedInSecondIteration

    movedEvents = R.pipe(
      R.concat(splitEvents[0]),
      R.flatten
    )(moved)
  }

  return movedEvents
}
