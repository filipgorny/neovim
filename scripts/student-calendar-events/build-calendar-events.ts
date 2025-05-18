import { buildCalendarForStudent } from '../../src/modules/student-calendar-events/student-calendar-builder'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const studentCourseId = process.argv[2]

  console.log(`Start building calendar events for student course ${studentCourseId}`)

  await buildCalendarForStudent(studentCourseId, true)

  console.log('Done')

  process.exit(0)
})()
