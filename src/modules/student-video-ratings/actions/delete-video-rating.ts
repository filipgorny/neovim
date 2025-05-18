import { deleteVideoRating } from '../student-video-ratings-service'

export default async (student, video_id: string) => (
  deleteVideoRating(student.id, video_id)
)
