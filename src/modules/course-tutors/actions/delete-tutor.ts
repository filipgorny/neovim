import { deleteEntity } from '../course-tutors-service'

export default async (id: string) => (
  deleteEntity(id)
)
