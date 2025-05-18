import { StudentCourse } from '../../../types/student-course'
import { findBoxes } from '../student-flashcard-boxes-repository'

export default async (studentCourse: StudentCourse) => (
  findBoxes(studentCourse.id)
)
