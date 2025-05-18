import R from 'ramda'
import { updateCourse } from '../course-service'
import { checkIfAlreadyExists } from '../validation/check-if-exists'
import { validateExternalIdAlreadyExists } from '../validation/validate-external-id'
import { validateCodenameAlreadyExists } from '../validation/validate-codename'
import { UpdateCoursePayload } from './types/update-course-payload-type'
import { UploadedFile } from 'express-fileupload'

export default async (id: string, payload: UpdateCoursePayload, imageFile?: UploadedFile) => (
  R.pipeWith(R.andThen)([
    checkIfAlreadyExists(id),
    validateExternalIdAlreadyExists(id),
    validateCodenameAlreadyExists(id),
    updateCourse(id, imageFile),
  ])(payload)
)
