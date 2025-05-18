import { deleteEntity } from '../book-content-course-topics-service'

export default async (id: string) => (
  deleteEntity(id)
)
