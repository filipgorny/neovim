import { updatePreviewState } from '../student-book-service'

type Payload = {
  preview_state: string,
}

export default async (id: string, payload: Payload) => (
  updatePreviewState(id, payload.preview_state)
)
