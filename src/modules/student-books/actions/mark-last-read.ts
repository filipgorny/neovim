import { StudentCourse } from '../../../types/student-course'
import { fetchStudentBook } from '../student-book-repository'
import { markReadChapterAndPart } from '../student-book-service'

export default async (student, originalBookId: string, chapterOrder: string, part: string, studentCourse: StudentCourse, payload: any) => {
  const book = await fetchStudentBook(student.id, originalBookId, studentCourse)

  return markReadChapterAndPart(book.id, chapterOrder, part, payload.student_book_subchapter_id)
}
