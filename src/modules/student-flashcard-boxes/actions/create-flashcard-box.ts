import { createEntity } from '../student-flashcard-boxes-service'
import { StudentCourse } from '../../../types/student-course'
import { validateBookBelongsToStudent, validateTitleIsUnique } from '../validation'

type Payload = {
  student_book_id: string,
  title: string,
}

export default async (user, studentCourse: StudentCourse, payload: Payload) => {
  await Promise.all([
    validateBookBelongsToStudent(payload.student_book_id, user.id),
    validateTitleIsUnique(studentCourse.id, payload.title),
  ])

  return createEntity({
    ...payload,
    student_course_id: studentCourse.id,
  })
}
