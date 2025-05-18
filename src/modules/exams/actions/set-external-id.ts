import * as R from 'ramda'
import { setExternalId } from '../exam-service'
import { findOne } from '../exam-repository'
import { examExternalIdAlreadyExistsException, throwException } from '../../../../utils/error/error-factory'

const findByExternalId = async external_id => (
  R.unless(
    R.isNil,
    async () => findOne({
      external_id,
    })
  )(external_id)
)

const validateExistingExam = currentExamId => async externalId => (
  R.pipeWith(R.andThen)([
    findByExternalId,
    R.unless(
      R.isNil,
      R.unless(
        R.propEq('id', currentExamId),
        () => throwException(examExternalIdAlreadyExistsException())
      )
    ),
  ])(externalId)
)

export default async (id: string, payload, user) => {
  const { external_id } = payload

  await validateExistingExam(id)(external_id)

  return setExternalId(id)(external_id, user.id)
}
