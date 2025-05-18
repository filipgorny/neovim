import R from 'ramda'
import { earnSaltyBucksForResource } from '../../../../services/salty-bucks/salty-buck-service'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { fetchStudentVideoResource, patchWhereIn } from '../../student-book-content-resources/student-book-content-resource-repository'
import { findOne as findOriginalVideo } from '../../videos/video-repository'
import { findOne as findSaltyBucks } from '../../salty-bucks-log/salty-bucks-log-repository'
import { upsertStudentVideo } from '../student-video-service'
import { markEventAsCompletedByStudentCourseAndStudentItemId, markEventAsCompletedByStudentItemId } from '../../student-calendar-events/student-calendar-events-service'
import { StudentCourse } from '../../../types/student-course'

const PERCENTAGE_OF_VIDEO_WATCHED_MARK = 90

type UpdateWatchedTimestampPayload = {
  video_timestamp: number,
}

const validateVideoTimestamp = (timestamp: number, video) => {
  const duration = Number(video.duration)

  if (timestamp > duration && timestamp > 0) {
    throwException(
      customException(
        'value.out-of-bound',
        422,
        `Video timestamp has to be in video duration range <0, ${duration}>, in seconds`
      )
    )
  }
}

const getMinimalTimestampToMarkVideoAsWatched = R.pipe(
  R.prop('duration'),
  Number,
  R.multiply(PERCENTAGE_OF_VIDEO_WATCHED_MARK),
  R.divide(R.__, 100),
  R.invoker(1, 'toFixed')(2),
  Number
)

const isVideoWatched = (timestamp: number, resource): boolean => (
  timestamp > getMinimalTimestampToMarkVideoAsWatched(resource)
)

export default async (studentCourse: StudentCourse, studentId: string, videoId: string, payload: UpdateWatchedTimestampPayload) => {
  let resource, ids
  let isStudentVideo = false
  let patched

  try {
    [resource, ids] = await fetchStudentVideoResource(videoId, studentId)

    isStudentVideo = true
  } catch (error) {
    resource = await findOriginalVideo({ id: videoId })

    resource.type = 'video'
    resource.external_id = videoId
  }

  validateVideoTimestamp(payload.video_timestamp, resource)

  const deltaObject = resource.delta_object ? JSON.parse(resource.delta_object) : {}
  const isWatched = isVideoWatched(payload.video_timestamp, resource)

  if (!resource.delta_object) {
    const saltyBucksForVideo = await findSaltyBucks({ student_id: studentId, reference_id: videoId })

    if (saltyBucksForVideo) {
      deltaObject.is_watched = true
    }
  }

  await markEventAsCompletedByStudentCourseAndStudentItemId(studentCourse.id, videoId)

  const dto = {
    delta_object: JSON.stringify({
      ...deltaObject,
      video_timestamp: payload.video_timestamp,
      is_watched: deltaObject?.is_watched ? deltaObject?.is_watched : isWatched,
    }),
    is_read: deltaObject?.is_watched ? deltaObject?.is_watched : isWatched,
  }

  if (isStudentVideo) {
    patched = await patchWhereIn(ids, dto)
  } else {
    patched = await upsertStudentVideo(studentId, videoId, dto)
  }

  if (isWatched && !deltaObject?.is_watched) {
    await earnSaltyBucksForResource(studentId, resource, studentCourse)
  }

  return R.pipe(
    R.invoker(0, 'toJSON'),
    video => ({
      ...video,
      delta_object: null,
      ...JSON.parse(video.delta_object),
    })
  )(patched)
}
