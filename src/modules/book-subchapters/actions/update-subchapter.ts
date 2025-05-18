import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/update-subchapter-schema'
import { updateSubchapter } from '../book-subchapter-service'
import { findOneOrFail } from '../book-subchapter-repository'

export default async (id: string, payload) => {
  validateEntityPayload(schema)(payload)

  const subchapter = await findOneOrFail({ id })

  return updateSubchapter(subchapter.id)({
    title: payload.title,
  })
}
