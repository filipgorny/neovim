import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/create-text-book-content-schema'
import asAsync from '../../../../utils/function/as-async'
import { findOneOrFail as findSubchapter } from '../../book-subchapters/book-subchapter-repository'
import { createBookContent } from '../book-content-service'
import { fixBookContentOrderAfterAdding } from '../book-content-repository'

const prepareAndSaveNewSubchapter = async payload => {
  const { type, subchapterId, raw, delta_object, order, content_html } = payload
  const subchapter = await findSubchapter({ id: subchapterId })

  await fixBookContentOrderAfterAdding(subchapterId, order)

  return createBookContent(type, order, raw, delta_object, subchapter.id, content_html)
}

export default async payload => (
  R.pipeWith(R.andThen)([
    asAsync(validateEntityPayload(schema)),
    prepareAndSaveNewSubchapter,
  ])(payload)
)
