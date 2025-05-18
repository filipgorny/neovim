import { deepSubtractSnapshotObjects, getStudentFlashcardArchiveSnapshotObjectByCourseId } from '../../student-flashcard-archive/student-flashcard-archive-service'
import { bumpAccessedAt, getFlashcardSnapshotByCourseId, updateFlashcardSnapshot } from '../student-course-service'
import { findOneOrFail } from '../student-courses-repository'
import { transformFlashcardSnapshotObject } from '../student-courses-transformers'
import { getFirstLiveCourseDay } from './utils/get-first-live-course-day'

export default async (student, id: string) => {
  const studentCourse = await findOneOrFail({ id, student_id: student.id }, ['original', 'mcatDate', 'endDate.days'])
  const archiveSnapshotObject = await getStudentFlashcardArchiveSnapshotObjectByCourseId(id)
  let flashcardSnapshotObject

  if (!studentCourse.flashcard_snapshot) {
    flashcardSnapshotObject = await getFlashcardSnapshotByCourseId(id)
  } else {
    flashcardSnapshotObject = JSON.parse(studentCourse.flashcard_snapshot)
  }

  await transformFlashcardSnapshotObject(flashcardSnapshotObject)
  await transformFlashcardSnapshotObject(archiveSnapshotObject)
  studentCourse.flashcard_snapshot = JSON.stringify(deepSubtractSnapshotObjects(flashcardSnapshotObject, archiveSnapshotObject))
  studentCourse.endDateFirstDay = getFirstLiveCourseDay(studentCourse)

  const updatedCourse = await bumpAccessedAt(id)
  studentCourse.accessed_at = updatedCourse.get('accessed_at')

  return studentCourse
}
