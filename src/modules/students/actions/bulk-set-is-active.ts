import { bulkSetIsActive } from '../student-repository'

type Payload = {
  is_active: boolean,
  ids: string[]
}

export default async (payload: Payload) => (
  bulkSetIsActive(payload.is_active, payload.ids)
)
