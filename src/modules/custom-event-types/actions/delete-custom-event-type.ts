import { deleteCustomEventType } from '../custom-event-types-service'

export default async (id: string) => (
  deleteCustomEventType(id)
)
