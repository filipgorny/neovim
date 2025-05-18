import { StudentCourse } from '../../../types/student-course'
import { find } from '../ai-tutor-scores-repository'

export default async (studentCourse: StudentCourse, query) => (
  find(query, { student_course_id: studentCourse.id }, ['chapter'])
)
