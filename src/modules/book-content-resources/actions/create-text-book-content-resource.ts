import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/create-text-book-content-resource-schema'
import asAsync from '../../../../utils/function/as-async'
import { findOneOrFail as findContent } from '../../book-contents/book-content-repository'
import { createBookContentResource } from '../book-content-resource-service'

const getOrderFromResources = (resources): number => R.pipe(
  R.prop('length'),
  Number,
  R.inc
  // @ts-ignore
)(resources)

const prepareAndSaveResource = async payload => {
  const { type, contentId, raw, delta_object } = payload
  const content = await findContent({ id: contentId }, ['resources'])
  const order = getOrderFromResources(content.resources)

  return createBookContentResource(type, order, raw, delta_object, content.id)
}

export default async payload => (
  R.pipeWith(R.andThen)([
    asAsync(validateEntityPayload(schema)),
    prepareAndSaveResource,
  ])(payload)
)
