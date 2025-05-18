import { removeFlashcard } from '../flashcard-service'

export default async (id: string) => (
  removeFlashcard(id)
)
