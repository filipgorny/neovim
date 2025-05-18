import { schema as createVideo } from './create-video-schema'
import { schema as updateVideo } from './update-video-schema'
import { schema as setFakeRating } from './set-fake-rating-schema'
import { schema as toggleFakeRating } from './toggle-fake-rating-schema'

export default {
  createVideo,
  updateVideo,
  setFakeRating,
  toggleFakeRating,
}
