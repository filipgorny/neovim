import { findStudent } from '../student-service'
import attachProducts, { Payload } from './attach-products'

export default async (student_id: string, payload: Payload) => {
  const student = await findStudent(student_id)

  return attachProducts(student, payload)
}
