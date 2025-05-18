import { toggleAdminCourse } from '../admin-courses-service'

export default async (admin_id: string, course_id: string) => (
  toggleAdminCourse(course_id, admin_id)
)
