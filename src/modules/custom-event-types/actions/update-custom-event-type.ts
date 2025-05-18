import { updateCustomEventType } from '../custom-event-types-service'

type Payload = {
  custom_event_group_id: string
  title: string
  duration?: number
}

export default async (id: string, payload: Payload) => (
  updateCustomEventType(id, payload)
)
