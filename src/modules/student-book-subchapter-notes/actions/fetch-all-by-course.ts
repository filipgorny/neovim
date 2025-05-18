import { StudentCourse } from '../../../types/student-course'
import { fetchNotesByStudentCourse } from '../student-book-subchapter-notes-repository'

export default async (studentCourse: StudentCourse, query) => (
  fetchNotesByStudentCourse(query, studentCourse.id, studentCourse.student_id)
)
