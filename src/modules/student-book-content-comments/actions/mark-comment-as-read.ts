import { StudentCourse } from '../../../types/student-course'
import { markCommentAsRead } from '../student-book-content-comments-service'

export default async (studentCourse: StudentCourse, book_content_id: string) => (
  markCommentAsRead(studentCourse.id, book_content_id)
)
