import { setFlashcardCode } from '../flashcard-repository'

type Payload = {
  code: number,
}

export default async (id: string, payload: Payload) => (
  setFlashcardCode(id, payload.code)
)
