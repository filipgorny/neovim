import { StudentCourse } from '../../../types/student-course'
import { find } from '../student-calendar-events-repository'

export default async (studentCourse: StudentCourse, query, event_date: string) => (
  find(query, { student_course_id: studentCourse.id, event_date })
)
