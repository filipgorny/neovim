import { transferProductsAndRemoveOldStudent } from '../student-service'

export default async (from_student_id: string, to_student_id: string) => (
  transferProductsAndRemoveOldStudent(from_student_id, to_student_id)
)
