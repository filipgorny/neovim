import moment, { Moment } from 'moment'
import * as R from 'ramda'
import { addFreeWeeksToMomentDates } from '../../services/student-calendar-events/add-free-weeks'

const addFreeWeeks = (events, freeWeeksAmount) => {
  console.log(events)

  let movedEvents = events

  for (let i = 0; i < freeWeeksAmount; i++) {
    const grouped = R.groupBy(
      event => moment(event.event_date).isoWeek()
    )(movedEvents)

    const splitEvents = R.splitAt(i + 1, R.values(grouped))

    const moved = R.pipe(
      R.flatten,
      R.map(
        event => {
          event.event_date = moment(event.event_date).add(7, 'days').format('YYYY-MM-DD')

          return event
        }
      )
    )(splitEvents[1])

    movedEvents = R.pipe(
      R.concat(splitEvents[0]),
      R.flatten
    )(moved)
  }

  return movedEvents
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const events = [
    { event_date: '2024-02-26' }, { event_date: '2024-02-28' }, { event_date: '2024-02-29' }, { event_date: '2024-03-02' },
    { event_date: '2024-03-04' }, { event_date: '2024-03-05' }, { event_date: '2024-03-08' },
    { event_date: '2024-03-10' }, { event_date: '2024-03-13' }, { event_date: '2024-03-15' },
    { event_date: '2024-03-16' }, { event_date: '2024-03-18' }, { event_date: '2024-03-19' },
    { event_date: '2024-03-20' }, { event_date: '2024-03-22' }, { event_date: '2024-03-24' },
    { event_date: '2024-03-25' }, { event_date: '2024-03-27' }, { event_date: '2024-03-30' },
    { event_date: '2024-04-02' }, { event_date: '2024-04-04' }, { event_date: '2024-04-07' },
  ]

  const momentDates = events.map(event => moment(event.event_date))
  console.log(momentDates)

  const moved2 = addFreeWeeksToMomentDates(momentDates, 3, moment('2024-04-28'))

  // this way we can modify the specificDates in book events builder
  // const specificDates = getSpecificDates(studentCourse.calendar_start_at, lastExamDate, calendarSettings.preferred_days_chapters, daysOff, studentDaysOff)
  // that way we don't need to update anything in the db and we can just add the free weeks to the specificDates, exams will be moved as well

  console.log(moved2)

  process.exit(0)
})()
