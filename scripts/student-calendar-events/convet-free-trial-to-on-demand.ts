import { int } from '@desmart/js-utils'
import { archiveEventsLockedInFreeTrial } from '../../src/modules/student-calendar-events/student-calendar-events-service'
import { findOne as findStudentCourse, patch } from '../../src/modules/student-courses/student-course-repository'
import { StudentCourseTypes } from '../../src/modules/student-courses/student-course-types'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const studentCourseId = process.argv[2]
  const daysAmount = process.argv[3]

  console.log(`Converting student course ${studentCourseId} from free trial to subscription (on demand)`)

  const studentCourse = await findStudentCourse({ id: studentCourseId })

  await patch(studentCourse.id, { type: StudentCourseTypes.onDemand })
  await archiveEventsLockedInFreeTrial(studentCourse, int(daysAmount))

  console.log('Done')

  process.exit(0)
})()
