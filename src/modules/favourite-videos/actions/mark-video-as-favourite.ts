import { markVideoAsFavourite } from '../favourite-videos-service'

export default async (student, video_id: string) => (
  markVideoAsFavourite(student.id, video_id)
)
