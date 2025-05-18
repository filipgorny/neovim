import { setReviewVideoId } from '../exam-service'

type Payload = {
  review_video_id: string | null,
}

export default async (id: string, payload: Payload) => (
  setReviewVideoId(id, payload.review_video_id)
)
