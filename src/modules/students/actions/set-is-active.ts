import { setIsActive } from '../student-repository'

type Payload = {
  is_active: boolean
}

export default async (id: string, payload: Payload) => (
  setIsActive(id, payload.is_active)
)
