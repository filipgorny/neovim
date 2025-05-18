import { createCustomEventType } from '../custom-event-types-service'

type Payload = {
  custom_event_group_id: string
  title: string
  duration?: number
}

export default async (payload: Payload) => (
  createCustomEventType(payload)
)
