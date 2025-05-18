import { deleteEntity } from '../student-flashcard-boxes-service'
import { StudentCourse } from '../../../types/student-course'
import { validateBoxBelongsToStudent } from '../validation'

export default async (id: string, studentCourse: StudentCourse) => {
  await validateBoxBelongsToStudent(id, studentCourse.id)

  return deleteEntity(id)
}
