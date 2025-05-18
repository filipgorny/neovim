import R from 'ramda'
import { checkIfSpecifiedBookContentAttachmentExist } from '../student-book-content-attachment-repository'
import { notFoundException } from '../../../../utils/error/error-factory'
import { updateBookContentAttachment } from '../student-book-content-attachment-service'

export interface UpdateBookContentAttachmentPayload {
  delta_object?: object
}

interface ValidateIfBookContentAttachmentExistCommand {
  studentId: string;
  attachmentId: string;
}

const validateIfBookContentAttachmentExist = (command: ValidateIfBookContentAttachmentExistCommand) => async (payload: UpdateBookContentAttachmentPayload) => {
  const bookAttachmentExist = await checkIfSpecifiedBookContentAttachmentExist(command)

  if (!bookAttachmentExist) {
    throw notFoundException('StudentBookContentAttachment')
  }

  return payload
}

export default async (studentId: string, attachmentId: string, payload: UpdateBookContentAttachmentPayload) => {
  return R.pipeWith(R.andThen)([
    validateIfBookContentAttachmentExist({ studentId, attachmentId }),
    updateBookContentAttachment({ id: attachmentId }),
  ])(payload)
}
