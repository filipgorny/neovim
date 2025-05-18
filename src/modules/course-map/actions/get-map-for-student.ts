import { findAvailableForStudent } from '../course-map-repository'

export default async (course_id: string, student_id: string, query: any = {}) => (
  findAvailableForStudent({ ...query.filter, courseId: course_id, studentId: student_id })
)
