import { getAllCourseIds } from '../../src/modules/student-courses/student-course-repository'
import { updateFlashcardSnapshot } from '../../src/modules/student-courses/student-course-service'
import mapP from '../../utils/function/mapp'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  console.log('Updating flashcard snapshots for all student courses')

  const courseIds = await getAllCourseIds()
  await mapP(updateFlashcardSnapshot)(courseIds)

  console.log('Done')

  process.exit(0)
})()
