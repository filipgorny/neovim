import * as R from 'ramda'
import { findOneOrFail as findPinNote } from '../student-book-content-pins-repository'
import { validatePinBelongsToStudent } from '../validation/validate-pin-belongs-to-student'

export default async (student, id) => {
  const pinNote = await findPinNote({ id }, ['content.subchapter.chapter.book'])

  validatePinBelongsToStudent(student.id)(pinNote)

  return R.omit(['content'])(pinNote)
}
