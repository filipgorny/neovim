import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/update-video-book-content-resource-schema'
import asAsync from '../../../../utils/function/as-async'
import { updateBookContentResource } from '../book-content-resource-service'
import { findOneOrFail as findResource } from '../book-content-resource-repository'
import { findOneOrFail as findVideo } from '../../videos/video-repository'

const prepareAndSaveResource = (id: string) => async payload => {
  const { videoId } = payload
  const resource = await findResource({ id })
  const video = await findVideo({ id: videoId })

  return updateBookContentResource(resource.id, undefined, undefined, video.id)
}

export default async (id: string, payload) => (
  R.pipeWith(R.andThen)([
    asAsync(validateEntityPayload(schema)),
    prepareAndSaveResource(id),
  ])(payload)
)
