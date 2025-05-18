import { customException, throwException } from '@desmart/js-utils'
import { FlashcardStudyMode } from '../flashcard-study-modes'
import { setFlashcardStudyMode } from '../student-service'

export default async (student, mode: string) => {
  if (!(Object.values(FlashcardStudyMode) as string[]).includes(mode)) {
    throwException(customException('dashboard.flashcard-study.invalid-mode', 404, 'Invalid flashcard study mode'))
  }

  return setFlashcardStudyMode(student.id, mode as FlashcardStudyMode)
}
