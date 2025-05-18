import moment from 'moment'
import { buildPreReadingCalendarForStudent } from '../../src/modules/student-calendar-events/student-pre-reading-calendar-builder'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const studentCourseId = process.argv[2]
  const dateStart = process.argv[3] || moment().format('YYYY-MM-DD')
  const dateEnd = process.argv[4] || moment().add(30, 'days').format('YYYY-MM-DD')

  console.log(`Start building pre-reading calendar events for student course ${studentCourseId}`)
  console.log(`${dateStart} - ${dateEnd}`)

  await buildPreReadingCalendarForStudent(studentCourseId, moment(dateStart), moment(dateEnd), true)

  console.log('Done')

  process.exit(0)
})()
