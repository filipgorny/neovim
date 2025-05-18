import R from 'ramda'
import { createCourse } from '../course-service'
import { checkIfAlreadyExists } from '../validation/check-if-exists'
import { checkIfExternalIdAlreadyExists } from '../validation/check-if-external-id-already-exists'
import { checkIfCodenameAlreadyExists } from '../validation/check-if-codename-already-exists'
import { createDefaultCalendarSettings } from '../../calendar-settings/calendar-settings-service'
import { UploadedFile } from 'express-fileupload'

export default async (payload, imageFile?: UploadedFile) => {
  const course = await R.pipeWith(R.andThen)([
    checkIfAlreadyExists(),
    checkIfExternalIdAlreadyExists,
    checkIfCodenameAlreadyExists,
    createCourse(imageFile),
  ])(payload)

  await createDefaultCalendarSettings(course.id)

  return course
}
