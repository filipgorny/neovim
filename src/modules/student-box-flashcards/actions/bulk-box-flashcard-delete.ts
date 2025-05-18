import { StudentCourse } from '../../../types/student-course'
import { findOneOrFail as findCustomBox } from '../../student-flashcard-boxes/student-flashcard-boxes-repository'
import { removeFlashcardsFromBoxInBulk } from '../student-box-flashcards-service'

const validateBoxBelongsToStudent = async (box_id: string, student_course_id: string) => (
  findCustomBox({
    id: box_id,
    student_course_id,
  })
)

export default async (studentCourse: StudentCourse, box_id: string, payload: string[]) => {
  await validateBoxBelongsToStudent(box_id, studentCourse.id)

  return removeFlashcardsFromBoxInBulk(box_id, payload)
}
