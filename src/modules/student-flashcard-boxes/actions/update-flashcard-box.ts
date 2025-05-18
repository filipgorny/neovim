import { StudentCourse } from '../../../types/student-course'
import { patchEntity } from '../student-flashcard-boxes-service'
import { validateBoxBelongsToStudent, validateTitleIsUnique } from '../validation'

type Payload = {
  title: string,
}

export default async (id: string, studentCourse: StudentCourse, payload: Payload) => {
  await Promise.all([
    validateBoxBelongsToStudent(id, studentCourse.id),
    validateTitleIsUnique(studentCourse.id, payload.title, id),
  ])

  return patchEntity(id, payload)
}
