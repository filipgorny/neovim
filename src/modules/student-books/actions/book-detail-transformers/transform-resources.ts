import * as R from 'ramda'
import generateStaticUrl from '../../../../../services/s3/generate-static-url'
import getVimeoStaticLink from '../../../../../services/vimeo/get-vimeo-static-link'

const getVideoSource = (video_bg_music_enabled: boolean) => video => {
  if (video_bg_music_enabled || !video.source_no_bg_music) {
    return getVimeoStaticLink(video.video_source)
  }

  return getVimeoStaticLink(video.source_no_bg_music)
}

export const transformResources = (video_bg_music_enabled: boolean) => R.when(
  R.has('resources'),
  R.over(
    R.lensProp('resources'),
    R.map(
      video => {
        return R.evolve({
          external_id: R.always(undefined),
          video_thumbnail: generateStaticUrl,
          video_source: getVimeoStaticLink,
          video_source_no_bg_music: getVimeoStaticLink,
        })(video)
      }
    )
  )
)
