import * as R from 'ramda'
import { customException, throwException } from '@desmart/js-utils'
import { findOne } from '../course-repository'
import { UpdateCoursePayload } from '../actions/types/update-course-payload-type'

export const validateCodenameAlreadyExists = (exclude_id: string) => async (payload: UpdateCoursePayload) => (
  R.pipeWith(R.andThen)([
    findOne,
    R.ifElse(
      R.anyPass([
        R.isNil,
        R.propEq('id', exclude_id),
      ]),
      R.always(payload),
      () => throwException(customException('products.codename.already-exists', 422, 'Codename already exists'))
    ),
  ])({ codename: payload.codename })
)
