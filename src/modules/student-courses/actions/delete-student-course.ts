import { removeSoftly } from '../student-course-repository'

export default async (studentCourseId: string) => (
  removeSoftly(studentCourseId)
)
