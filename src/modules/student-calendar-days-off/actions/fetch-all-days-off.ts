import { StudentCourse } from '../../../types/student-course'
import { find } from '../student-calendar-days-off-repository'

export default async (studentCourse: StudentCourse, query) => (
  find({ limit: { page: 1, take: 1000 }, order: { by: 'day_off_date', dir: 'asc' } }, { student_course_id: studentCourse.id })
)
