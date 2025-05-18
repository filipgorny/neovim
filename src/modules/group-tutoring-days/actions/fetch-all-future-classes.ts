import { findFutureDays } from '../group-tutoring-days-repository'
import { StudentCourse } from '../../../types/student-course'

export default async (studentCourse: StudentCourse) => {
  return findFutureDays(studentCourse.book_course_id)
}
