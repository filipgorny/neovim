import R from 'ramda'
import { notFoundException } from '../../../../utils/error/error-factory'
import {
  checkIfSpecifiedChapterExistAndBookIsActive,
  upsertSubchapterNote,
  findOne,
  deleteRecord
} from '../student-book-subchapter-notes-repository'

export interface AddOrUpdatePayload {
  raw: string,
  delta_object: { ops: Array<{ insert: string }> },
}

interface CheckIfSpecifiedSubchapterExistCommand {
  studentId: string,
  subchapterId: string,
}

type AddOrUpdateSubchapterNoteCommand = CheckIfSpecifiedSubchapterExistCommand

const checkIfSpecifiedSubchapterExist = (command: CheckIfSpecifiedSubchapterExistCommand) => async (payload: AddOrUpdatePayload) => {
  const subchapterExist = await checkIfSpecifiedChapterExistAndBookIsActive(command)

  if (!subchapterExist) {
    throw notFoundException('StudentBookSubchapter')
  }

  return payload
}

const addOrUpdateSubchapterNote = (command: AddOrUpdateSubchapterNoteCommand) => async (payload: AddOrUpdatePayload) => {
  const note = await findOne({
    student_id: command.studentId,
    subchapter_id: command.subchapterId,
  })

  const textContent = R.pipe(
    R.map(R.prop('insert')),
    R.filter(insert => !!insert && typeof insert === 'string'),
    R.join(''),
    R.trim
  )(payload.delta_object.ops)

  if (note && !textContent) {
    return deleteRecord(note.id)
  }

  return upsertSubchapterNote({
    studentId: command.studentId,
    subchapterId: command.subchapterId,
    upsertModel: {
      ...payload,
      updated_at: new Date(),
    },
    select: ['raw', 'delta_object', 'id', 'updated_at'],
  })
}

export default async (studentId: string, subchapterId: string, payload: AddOrUpdatePayload) => {
  const command = { studentId, subchapterId }

  return R.pipeWith(R.andThen)([
    checkIfSpecifiedSubchapterExist(command),
    addOrUpdateSubchapterNote(command),
  ])(payload)
}
