import { StudentCourse } from '../../../types/student-course'
import { find } from '../student-book-content-course-topics-repository'

export default async (studentCourse: StudentCourse, student_book_content_id: string) => (
  find({ limit: { page: 1, take: 100 }, order: { by: 'id', dir: 'asc' } }, { student_course_id: studentCourse.id, student_book_content_id }, ['studentCourseTopic'])
)
