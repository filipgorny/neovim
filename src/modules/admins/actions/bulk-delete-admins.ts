import * as R from 'ramda'
import { cannotDeleteSelfException, throwException } from '../../../../utils/error/error-factory'
import { bulkDelete } from '../admin-repository'

type Payload = {
  ids: string[]
}

const throwWhenIdsAreEqual = () => throwException(cannotDeleteSelfException())

const validateSelfDelete = (id: string) => R.pipe(
  R.when(
    R.includes(id),
    throwWhenIdsAreEqual
  )
)

export default async (user, payload: Payload) => {
  const { ids } = payload

  validateSelfDelete(user.id)(ids)

  return bulkDelete(payload.ids)
}
