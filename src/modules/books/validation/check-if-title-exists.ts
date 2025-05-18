import * as R from 'ramda'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { findOne } from '../book-repository'

const throwTitleAlreadyExistsException = () => throwException(customException('books.title.already-exists', 403, 'Book title already exists'))

export const checkIfTitleAlreadyExists = (excludeId?: string) => async (payload) => (
  R.pipeWith(R.andThen)([
    async () => findOne({ title: payload.title }),
    R.ifElse(
      R.isNil,
      R.always(payload),
      R.ifElse(
        R.propEq('id', excludeId),
        R.always(payload),
        throwTitleAlreadyExistsException
      )
    ),
  ])(true)
)
