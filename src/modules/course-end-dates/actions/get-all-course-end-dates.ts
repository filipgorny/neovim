import { getAllCourseEndDates } from '../course-end-dates-service'

export default async (course_id: string, query: { order: { by: string, dir: 'asc' | 'desc' }}) => (
  getAllCourseEndDates(course_id, query)
)
