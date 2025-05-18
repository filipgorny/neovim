import { deleteCustomEventGroup } from '../custom-event-groups-service'

export default async (id: string) => (
  deleteCustomEventGroup(id)
)
