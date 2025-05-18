import * as R from 'ramda'
import { findOne as findStudent } from '../student-repository'
import { throwException, resourceAlreadyExistsException } from '../../../../utils/error/error-factory'

export const validateUsernameIsUnique = async (username: string) => R.pipeWith(R.andThen)([
  async () => findStudent({ username }),
  R.unless(
    R.isNil,
    () => throwException(resourceAlreadyExistsException(`student with username ${username}`))
  ),
])(true)
