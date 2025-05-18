import { updatePin } from '../student-book-content-pins-service'
import { findOneOrFail as findPinNote } from '../student-book-content-pins-repository'
import { validatePinBelongsToStudent } from '../validation/validate-pin-belongs-to-student'

type Payload = {
  note: string,
}

export default async (student, id, payload: Payload) => {
  const pinNote = await findPinNote({ id }, ['content.subchapter.chapter.book'])

  validatePinBelongsToStudent(student.id)(pinNote)

  return updatePin(id, payload.note)
}
