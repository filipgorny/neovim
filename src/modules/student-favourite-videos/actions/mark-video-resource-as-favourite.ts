import { markVideoResourceAsFavourite } from '../student-favourite-videos-service'

export default async (student, resource_id: string, studentCourse) => (
  markVideoResourceAsFavourite(student.id, resource_id, studentCourse.id)
)
