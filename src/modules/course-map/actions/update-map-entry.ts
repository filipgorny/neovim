import * as R from 'ramda'
import { updateCourseMapEntry } from '../course-map-service'
import { validatePayloadByType } from '../validation/validate-payload-by-type'
import { CourseMapTypes } from '../course-map-types'
import { findOne } from '../course-map-repository'
import { customException, throwException } from '../../../../utils/error/error-factory'

interface Payload {
  title: string,
  external_id: string,
  type: CourseMapTypes,
  metadata?: object,
}

const validateExternalIdAlreadyExists = async (external_id: string, exclude_id: string) => (
  R.pipeWith(R.andThen)([
    findOne,
    R.unless(
      R.anyPass([
        R.isNil,
        R.propEq('id', exclude_id),
      ]),
      () => throwException(customException('products.external-id.already-exists', 422, 'External ID already exists'))
    ),
  ])({ external_id })
)

export default async (id: string, itemId: string, payload: Payload) => {
  validatePayloadByType(payload)

  await validateExternalIdAlreadyExists(payload.external_id, itemId)

  return updateCourseMapEntry(itemId, payload)
}
