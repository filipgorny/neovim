import R from 'ramda'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import getVimeoStaticLink from '../../../../services/vimeo/get-vimeo-static-link'
import { StudentCourse } from '../../../types/student-course'
import { fetchVideosWithFavorites } from '../../videos/video-repository'

const defaultQuery = ({
  limit: {
    page: 1,
    take: 10,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

const getVideoSource = (video_bg_music_enabled: boolean) => video => {
  if (video_bg_music_enabled || !video.source_no_bg_music) {
    return getVimeoStaticLink(video.source)
  }

  return getVimeoStaticLink(video.source_no_bg_music)
}

export default async (student, query, studentCourse: StudentCourse) => R.pipeWith(R.andThen)([
  async () => fetchVideosWithFavorites(student.id, studentCourse.id, studentCourse)(prepareQuery(query)),
])(true)
