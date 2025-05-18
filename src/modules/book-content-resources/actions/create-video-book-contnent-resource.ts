import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/create-video-book-content-resource-schema'
import asAsync from '../../../../utils/function/as-async'
import { findOneOrFail as findContent } from '../../book-contents/book-content-repository'
import { findOneOrFail as findVideo } from '../../videos/video-repository'
import { createBookContentResource } from '../book-content-resource-service'

const getOrderFromResources = (resources): number => R.pipe(
  R.prop('length'),
  Number,
  R.inc
)(resources)

const prepareAndSaveResource = async payload => {
  const { type, contentId, videoId } = payload
  const content = await findContent({ id: contentId }, ['resources'])
  const video = await findVideo({ id: videoId })
  const order = getOrderFromResources(content.resources)

  return createBookContentResource(type, order, undefined, undefined, content.id, video.id)
}

export default async payload => (
  R.pipeWith(R.andThen)([
    asAsync(validateEntityPayload(schema)),
    prepareAndSaveResource,
  ])(payload)
)
