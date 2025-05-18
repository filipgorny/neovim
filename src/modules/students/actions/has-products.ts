import { hasProducts } from '../student-service'

export default async (student_id: string) => (
  hasProducts(student_id)
)
