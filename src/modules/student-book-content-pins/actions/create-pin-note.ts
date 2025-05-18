import { createPin } from '../student-book-content-pins-service'
import { findOneOrFail as findContent } from '../../student-book-contents/student-book-content-repository'
import { resourceAlreadyExistsException, throwException } from '@desmart/js-utils'
import { findOne } from '../student-book-content-pins-repository'
import { validateContentBelongsToStudent } from '../validation/validate-content-belongs-to-student'

type Payload = {
  content_id: string,
  variant: string,
  note: string,
}

const validatePinDoesNotAlreadyExist = async (content_id, variant) => {
  const pin = await findOne({ content_id, variant })

  if (pin) {
    throwException(resourceAlreadyExistsException('StudentBookContentPin'))
  }
}

export default async (student, payload: Payload) => {
  const content = await findContent({ id: payload.content_id }, ['subchapter.chapter.book'])

  validateContentBelongsToStudent(student.id)(content)
  await validatePinDoesNotAlreadyExist(content.id, payload.variant)

  return createPin(payload)
}
