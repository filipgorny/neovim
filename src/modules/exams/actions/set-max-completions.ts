import { setMaxCompletions } from '../exam-service'

type Payload = {
  max_completions: number
}

export default async (id: string, payload: Payload) => (
  setMaxCompletions(id, payload.max_completions)
)
