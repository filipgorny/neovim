import * as R from 'ramda'
import { createCourseMapEntry } from '../course-map-service'
import { validatePayloadByType } from '../validation/validate-payload-by-type'
import { findOne } from '../course-map-repository'
import { CourseMapTypes } from '../course-map-types'
import { customException, throwException } from '../../../../utils/error/error-factory'

interface Payload {
  title: string,
  external_id: string,
  type: CourseMapTypes,
  metadata?: object,
}

const validateExternalIdAlreadyExists = async (external_id: string) => (
  R.pipeWith(R.andThen)([
    findOne,
    R.unless(
      R.isNil,
      () => throwException(customException('products.external-id.already-exists', 422, 'External ID already exists'))
    ),
  ])({ external_id })
)

const validateTrialOrOnDemandAlreadyExists = async (book_course_id: string, type: string) => (
  R.pipeWith(R.andThen)([
    R.when(
      () => [CourseMapTypes.freeTrial.valueOf(), CourseMapTypes.onDemandCourse.valueOf()].includes(type),
      R.pipeWith(R.andThen)([
        findOne,
        R.tap(console.log),
        R.unless(
          R.isNil,
          () => throwException(customException('courses.type.' + type + '.already-exists', 422, 'Course type \'' + type + '\' already exists'))
        ),
      ])
    ),
  ])({ book_course_id, type })
)

export default async (id: string, payload: Payload) => {
  validatePayloadByType(payload)

  await validateExternalIdAlreadyExists(payload.external_id)
  // await validateTrialOrOnDemandAlreadyExists(id, payload.type)

  return createCourseMapEntry({
    book_course_id: id,
    ...payload,
  })
}
