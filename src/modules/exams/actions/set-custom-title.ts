import { setCustomTitle } from '../exam-service'

type Payload = {
  custom_title: string
}

export default async (id: string, payload: Payload) => (
  setCustomTitle(id, payload.custom_title)
)
