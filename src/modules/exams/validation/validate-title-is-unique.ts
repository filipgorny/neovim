import { throwException } from '@desmart/js-utils'
import * as R from 'ramda'
import { examTitleAlreadyExistsException } from '../../../../utils/error/error-factory'
import { findOne } from '../exam-repository'

export const validateTitleIsUnique = async (title, excludeId?: string) => (
  R.unless(
    R.isNil,
    async title => (
      findOne({ title })
        .then(instance => {
          if (instance) {
            if (excludeId && instance.id === excludeId) {
              return
            }

            throwException(examTitleAlreadyExistsException())
          }
        })
    )
  )(title)
)
