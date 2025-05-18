import * as R from 'ramda'
import { StudentBookContentPin, StudentBookContentPinDTO } from '../../types/student-book-content-pin'
import { create, patch, deleteRecord } from './student-book-content-pins-repository'
import { findOneOrFail as findStudentBookContent } from '../student-book-contents/student-book-content-repository'

export const createPin = async (dto: StudentBookContentPinDTO): Promise<StudentBookContentPin> => (
  create(dto)
)

export const updatePin = async (id: string, note: string) => (
  patch(id, {
    note,
  })
)

export const deletePin = async (id: string) => (
  deleteRecord(id)
)

export const deleteByContentId = async (contentId: string) => (
  R.pipeWith(R.andThen)([
    async () => findStudentBookContent({ id: contentId }, ['pinNotes']),
    R.prop('pinNotes'),
    R.map(async pinNote => deletePin(pinNote.id)),
  ])(true)
)
