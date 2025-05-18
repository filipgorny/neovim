import { deletePin } from '../student-book-content-pins-service'
import { findOneOrFail as findPinNote } from '../student-book-content-pins-repository'
import { validatePinBelongsToStudent } from '../validation/validate-pin-belongs-to-student'

export default async (student, id) => {
  const pinNote = await findPinNote({ id }, ['content.subchapter.chapter.book'])

  validatePinBelongsToStudent(student.id)(pinNote)

  return deletePin(id)
}
