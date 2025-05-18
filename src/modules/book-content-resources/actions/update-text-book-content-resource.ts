import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/update-text-book-content-resource-schema'
import asAsync from '../../../../utils/function/as-async'
import { updateBookContentResource } from '../book-content-resource-service'
import { findOneOrFail } from '../book-content-resource-repository'

const prepareAndSaveResource = (id: string) => async payload => {
  const { raw, delta_object } = payload
  const resource = await findOneOrFail({ id })

  return updateBookContentResource(resource.id, raw, delta_object)
}

export default async (id: string, payload) => (
  R.pipeWith(R.andThen)([
    asAsync(validateEntityPayload(schema)),
    prepareAndSaveResource(id),
  ])(payload)
)
