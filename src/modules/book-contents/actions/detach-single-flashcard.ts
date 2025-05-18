import { findOneInstanceOrFail as findFlashcard } from '../../flashcards/flashcard-repository'

export default async (contentId, flashcardId) => {
  const flashcard = await findFlashcard({ id: flashcardId }, ['contents'])

  await flashcard.contents().detach([contentId])

  return true
}
