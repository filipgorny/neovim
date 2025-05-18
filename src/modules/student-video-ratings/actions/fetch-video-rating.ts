import { findOneOrFail } from '../student-video-ratings-repository'

export default async (student, video_id: string) => (
  findOneOrFail({ student_id: student.id, video_id })
)
