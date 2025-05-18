import { setExternalId } from '../student-service'

type Payload = {
  external_id: string
}

export default async (id: string, payload: Payload) => (
  setExternalId(id, payload.external_id)
)
