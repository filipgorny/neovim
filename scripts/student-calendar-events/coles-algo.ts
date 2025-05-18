import moment from 'moment'
import { scheduleCalendarEvents } from '../../services/student-calendar-events/schedule-events-coles-algorithm'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const startDate = moment('2024-03-27')
  const endDate = moment('2024-07-05')
  const numTests = 5 // number of exams, from student course
  const numTasks = 44 // number of chapters (maybe something else as well), from student course and calendar settings
  const prioridays = [6, 0, 1, 0, 2, 3, 7] // priority for days (new setting, chosen by student), 0 - no work day, 1-5 are high to low priority, 6 is test day, 7 is review day

  const config = {
    startDate,
    endDate,
    prioridays,
    numTasks,
    numTests,
  }

  const schedule = scheduleCalendarEvents(config, true)

  schedule.map(day => {
    if (day.tasks.length > 0) {
      console.log(day)
    }

    return day
  })

  process.exit(0)
})()
