import { updateCustomEventGroup } from '../custom-event-groups-service'

type Payload = {
  course_id: string
  title: string
}

export default async (id: string, payload: Payload) => (
  updateCustomEventGroup(id, payload)
)
