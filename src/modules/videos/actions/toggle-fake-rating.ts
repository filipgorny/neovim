import { toggleFakeRating } from '../video-service'

type Payload = {
  use_fake_rating: boolean
}

export default async (id: string, payload: Payload) => (
  toggleFakeRating(id, payload.use_fake_rating)
)
