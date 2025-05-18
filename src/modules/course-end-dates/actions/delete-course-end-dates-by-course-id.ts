import { deleteByCourseId } from '../course-end-dates-repository'

export default async (course_id: string) => (
  deleteByCourseId(course_id)
)
