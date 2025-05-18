import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/attach-videos-schema'
import asAsync from '../../../../utils/function/as-async'
import { findVideosWithIds, patch as patchVideo } from '../../videos/video-repository'
import { attachVideos } from '../book-content-service'
import { VideoCategories } from '../../videos/video-categories'
import { customException, throwException } from '@desmart/js-utils'

const prepareAndSaveNewSubchapter = id => async payload => {
  const { ids } = payload
  const videos = await findVideosWithIds(ids)

  R.forEach(video => {
    if (video.category !== VideoCategories.books && video.category !== VideoCategories.draft) {
      throwException(customException('book-contents.attach-videos', 403, `Video category '${video.category}' is not allowed`))
    }
  })(videos)

  for (const video of videos) {
    if (video.category === VideoCategories.draft) {
      await patchVideo(video.id, { category: VideoCategories.books })
    }
  }

  return attachVideos(id, R.pluck('id')(videos))
}

export default async (id: string, payload: { ids: string[]}) => (
  R.pipeWith(R.andThen)([
    asAsync(validateEntityPayload(schema)),
    prepareAndSaveNewSubchapter(id),
  ])(payload)
)
