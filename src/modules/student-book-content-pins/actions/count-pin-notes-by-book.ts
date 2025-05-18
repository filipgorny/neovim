import { StudentCourse } from '../../../types/student-course'
import { countPinNotes } from '../student-book-content-pins-repository'

export default async (studentCourse: StudentCourse, id: string) => (
  countPinNotes(studentCourse, id)
)
