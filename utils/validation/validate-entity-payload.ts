import R from 'ramda'
import { throwException, customException } from '../error/error-factory'

const extractErrorDetails = R.pipe(
  R.prop('details'),
  R.pluck('message')
)

const dispatchException = message => throwException(customException('entity.invalid', 422, message))

const validateEntityPayload = schema => payload => {
  const { error } = schema.validate(payload, {
    abortEarly: false,
  })

  return R.ifElse(
    R.isNil,
    R.always(payload),
    R.pipe(
      extractErrorDetails,
      dispatchException
    )
  )(error)
}

export default validateEntityPayload
