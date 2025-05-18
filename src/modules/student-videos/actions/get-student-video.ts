import R from 'ramda'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import getVimeoStaticLink from '../../../../services/vimeo/get-vimeo-static-link'
import { StudentCourse } from '../../../types/student-course'
import { findStudentVideos, findOne } from '../student-videos-repository'
import { find as findNormalVideos } from '../../videos/video-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { findOne as findFavVideo } from '../../favourite-videos/favourite-videos-repository'
import { findOne as findStudentFavVideo } from '../../student-favourite-videos/student-favourite-videos-repository'

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

const mapStudentVideo = (video_bg_music_enabled: boolean) => video => ({
  ...video,
  is_watched: video.is_watched || false,
  video_timestamp: video.video_timestamp || 0,
})

const findVideo = async (id: string, student, studentCourse: StudentCourse) => {
  let video = await findStudentVideos(student.id, studentCourse, id)(prepareQuery({}), {})

  if (R.isEmpty(video.data)) {
    video = await findNormalVideos(prepareQuery({}), { id })
    video.data = collectionToJson(video.data)
    video.data = video.data.map(video => {
      video.delta_object = video.delta_object ? JSON.parse(video.delta_object) : null
      video.thumbnail = video.thumbnail ? generateStaticUrl(video.thumbnail) : null
      video.source = getVideoSource(student.get('video_bg_music_enabled'))(video)
      video.source_no_bg_music = getVimeoStaticLink(video.source_no_bg_music)
      return video
    })

    const customStudentVideoData = await findOne({ video_id: id, student_id: student.id })

    if (customStudentVideoData) {
      const deltaObject = JSON.parse(customStudentVideoData.delta_object)

      video.data[0].video_timestamp = deltaObject.video_timestamp
      video.data[0].is_watched = deltaObject.is_watched
    }
  }

  return video
}

const embedInfoAboutFavouriteVideos = (student_id: string) => async video => {
  const studentFavVideo = await findStudentFavVideo({ student_id, video_id: video.id })
  const favouriteVideo = await findFavVideo({ student_id, video_id: video.id })

  const favVideo = studentFavVideo || favouriteVideo

  return {
    ...video,
    is_favourite: !!favVideo,
  }
}

export default async (id: string, student, studentCourse: StudentCourse) => (
  R.pipeWith(R.andThen)([
    async () => findVideo(id, student, studentCourse),
    R.over(
      R.lensProp('data'),
      R.map(mapStudentVideo(student.get('video_bg_music_enabled')))
    ),
    R.prop('data'),
    R.head,
    embedInfoAboutFavouriteVideos(student.id),
  ])(true)
)
