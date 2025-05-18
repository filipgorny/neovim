import { updateMaxCompletions } from '../student-exam-service'

type Payload = {
  max_completions: number
}

export default async (id: string, payload: Payload) => (
  updateMaxCompletions(id, payload.max_completions)
)
