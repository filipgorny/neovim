import R from 'ramda'
import { updateBookContent } from '../student-book-content-service'
import { checkIfSpecifiedBookContentExist } from '../student-book-content-repository'
import { notFoundException } from '../../../../utils/error/error-factory'

export interface UpdateBookContentPayload {
  delta_object?: object;
}

interface ValidateIfBookContentExistCommand {
  studentId: string;
  contentId: string;
}

const validateIfBookContentExist = (command: ValidateIfBookContentExistCommand) => async (payload: UpdateBookContentPayload) => {
  const bookContentExist = await checkIfSpecifiedBookContentExist(command)

  if (!bookContentExist) {
    throw notFoundException('StudentBookContent')
  }

  return payload
}

export default async (studentId: string, contentId: string, payload: UpdateBookContentPayload) => {
  return R.pipeWith(R.andThen)([
    validateIfBookContentExist({ studentId, contentId }),
    updateBookContent({ id: contentId }),
  ])(payload)
}
