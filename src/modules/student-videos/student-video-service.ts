import { findOne, create, patch } from './student-videos-repository'

export const upsertStudentVideo = async (student_id: string, video_id: string, data: object) => {
  const video = await findOne({ student_id, video_id })

  return video ? patch(video.id, data) : create({ student_id, video_id, ...data })
}
