import { StudentCourse } from '../../../types/student-course'
import { findOne } from '../student-book-content-comments-repository'

export default async (studentCourse: StudentCourse, original_book_content_id: string) => (
  findOne({ student_course_id: studentCourse.id, original_book_content_id })
)
