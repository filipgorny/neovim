import { recalculateVideoRating } from '../videos/video-service'
import { create, patch, deleteWhere, findOne } from './student-video-ratings-repository'

type VideoRatingDTO = {
  video_id: string,
  student_id: string,
  rating: number,
}

export const createVideoRating = async (dto: VideoRatingDTO) => {
  const result = await create(dto)

  await recalculateVideoRating(dto.video_id)

  return result
}

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteVideoRating = async (student_id: string, video_id: string) => {
  await deleteWhere({
    student_id,
    video_id,
  })

  return recalculateVideoRating(video_id)
}

export const findVideoRating = async (student_id: string, video_id: string) => (
  findOne({ student_id, video_id })
)
