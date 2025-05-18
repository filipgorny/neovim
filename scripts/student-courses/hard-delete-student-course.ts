import { deleteStudentCourse } from '../../src/modules/student-courses/student-course-service'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const studentCourseId = process.argv[2]

  console.log(`Start hard deletion of student course ${studentCourseId} with all connected items`)

  await deleteStudentCourse(studentCourseId, {})

  console.log('Done')

  process.exit(0)
})()
