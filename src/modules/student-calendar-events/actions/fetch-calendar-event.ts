import { StudentCourse } from '../../../types/student-course'
import { findOneOrFail } from '../student-calendar-events-repository'

export default async (studentCourse: StudentCourse, id: string) => (
  findOneOrFail({ id, student_course_id: studentCourse.id })
)
