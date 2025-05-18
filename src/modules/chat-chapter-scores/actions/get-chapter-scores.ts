import { StudentCourse } from '../../../types/student-course'
import { find as findBooks } from '../../student-books/student-book-repository'

export default async (studentCourse: StudentCourse) => (
  findBooks({ limit: { page: 1, take: 100 }, order: { by: 'title', dir: 'asc' } }, { course_id: studentCourse.id }, ['chapters.chatScore'])
)
