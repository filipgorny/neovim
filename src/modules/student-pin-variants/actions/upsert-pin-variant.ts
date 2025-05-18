import { upsertPinVariant } from '../student-pin-variants-service'

type Payload = {
  student_book_id: string,
  variant: string,
  title?: string,
}

export default async (student, payload: Payload) => {
  const { student_book_id, variant, title } = payload

  return upsertPinVariant(student_book_id, student.id, variant, title)
}
