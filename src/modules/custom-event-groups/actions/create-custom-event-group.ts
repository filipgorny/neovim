import { createCustomEventGroup } from '../custom-event-groups-service'

type Payload = {
  course_id: string
  title: string
  colour_gradient_start?: string
  colour_gradient_end?: string
  colour_font?: string
}

export default async (payload: Payload) => (
  createCustomEventGroup(payload)
)
