import { unmarkVideoResourceAsFavourite } from '../student-favourite-videos-service'

export default async (student, resource_id: string, studentCourse) => (
  unmarkVideoResourceAsFavourite(student.id, resource_id, studentCourse.id)
)
