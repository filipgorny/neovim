import { setFakeRating } from '../video-service'

type Payload = {
  fake_rating: number
}

export default async (id: string, payload: Payload) => (
  setFakeRating(id, payload.fake_rating)
)
