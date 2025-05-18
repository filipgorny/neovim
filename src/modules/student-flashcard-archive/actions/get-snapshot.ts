import { validateStudentCourseBelongsToStudent } from '../../student-courses/validation/validate-student-course-belongs-to-student'
import { getStudentFlashcardArchiveSnapshotObjectByCourseId } from '../student-flashcard-archive-service'

export default async (student_course_id: string, student) => {
  await validateStudentCourseBelongsToStudent(student.id, student_course_id)

  return getStudentFlashcardArchiveSnapshotObjectByCourseId(student_course_id)
}
