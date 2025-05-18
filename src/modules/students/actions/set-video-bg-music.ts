import { setVideoBgMusic } from '../student-service'

type Payload = {
  video_bg_music_enabled: boolean,
}

export default async (student, payload: Payload) => (
  setVideoBgMusic(student.id, payload.video_bg_music_enabled)
)
