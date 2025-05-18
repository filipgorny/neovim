import { setGroupTuroringMeetingUrl } from '../course-service'

export default async (id: string, payload: {meeting_url: string}) => (
  setGroupTuroringMeetingUrl(id, payload.meeting_url)
)
