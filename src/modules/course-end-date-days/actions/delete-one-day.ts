import { deleteEntity } from '../course_end_date_days-service'

export default async (id: string) => (
  deleteEntity(id)
)
