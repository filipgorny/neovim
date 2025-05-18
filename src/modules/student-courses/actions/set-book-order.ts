import { patch } from '../student-course-repository'
import { setBookOrder } from '../student-course-service'
import { validateStudentCourseBelongsToStudent } from '../validation/validate-student-course-belongs-to-student'

export default async (student, student_course_id: string, bookOrderArray: string[]) => {
  await validateStudentCourseBelongsToStudent(student.id, student_course_id)

  return setBookOrder(student_course_id, JSON.stringify(bookOrderArray))
}
