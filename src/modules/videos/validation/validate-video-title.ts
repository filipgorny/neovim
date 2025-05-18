import { countByTitle } from '../video-repository'
import { videoTitleExistsException } from '../../../../utils/error/error-factory'

export default async (videoTitle: string) => {
  const existingVideosWithTheSameTitleCount = await countByTitle(videoTitle)

  if (existingVideosWithTheSameTitleCount > 0) {
    throw videoTitleExistsException()
  }
}
