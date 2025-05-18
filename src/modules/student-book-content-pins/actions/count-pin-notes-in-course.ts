import { StudentCourse } from '../../../types/student-course'
import { countPinNotes } from '../student-book-content-pins-repository'

export default async (studentCourse: StudentCourse) => (
  countPinNotes(studentCourse)
)
