import { customException, throwException } from '@desmart/js-utils'
import { validateUsernameIsUnique } from '../validation/validate-username-is-unique'
import * as R from 'ramda'
import { setUsername } from '../student-service'

export default async (student: any, payload: any) => {
  await validateUsernameIsUnique(R.prop('username')(payload))

  return R.pipe(
    R.prop('username'),
    R.ifElse(
      username => /^([A-Za-z0-9_.-]{3,15})$/.test(username),
      async username => setUsername(student.id, username),
      () => throwException(customException('entity.invalid', 422, 'Student username can consist only of 3 to 15 alphanumeric characters or underscores or hyphens or dots.'))
    )
  )(payload)
}
