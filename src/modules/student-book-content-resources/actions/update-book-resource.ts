import { updateBookContentResource } from '../student-book-content-resource-service'
import { checkIfSpecifiedBookContentResourceExist } from '../student-book-content-resource-repository'
import { notFoundException, throwException } from '../../../../utils/error/error-factory'

export interface UpdateBookResourcePayload {
  delta_object: object,
}

export default async (studentId: string, resourceId: string, payload: UpdateBookResourcePayload) => {
  const isExistingResource = await checkIfSpecifiedBookContentResourceExist(resourceId, studentId)

  if (isExistingResource) {
    return updateBookContentResource(resourceId, {
      delta_object: JSON.stringify(payload.delta_object),
    })
  } else {
    throwException(notFoundException('StudentBookContentResource'))
  }
}
