import { throwException } from '@desmart/js-utils'
import * as R from 'ramda'
import { examExternalIdAlreadyExistsException } from '../../../../utils/error/error-factory'
import { findOne } from '../exam-repository'

export const validateExternalIdIsUnique = async (externalId, excludeId?: string) => (
  R.unless(
    R.isNil,
    async external_id => (
      findOne({ external_id })
        .then(instance => {
          if (instance) {
            if (excludeId && instance.id === excludeId) {
              return
            }

            throwException(examExternalIdAlreadyExistsException())
          }
        })
    )
  )(externalId)
)
