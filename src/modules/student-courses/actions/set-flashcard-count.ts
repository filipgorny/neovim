import { patch } from '../student-course-repository'
import { validateStudentCourseBelongsToStudent } from '../validation/validate-student-course-belongs-to-student'

type Payload = {
  flashcard_count: number,
}

export default async (student, student_course_id: string, payload: Payload) => {
  await validateStudentCourseBelongsToStudent(student.id, student_course_id)

  return patch(student_course_id, payload)
}
