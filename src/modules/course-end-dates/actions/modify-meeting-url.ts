import { patchMeetingUrl } from '../course-end-dates-service'

type Payload = {
  meeting_url: string,
}

export default async (id: string, payload: Payload) => (
  patchMeetingUrl(id, payload.meeting_url)
)
