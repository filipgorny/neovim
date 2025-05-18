import { FlashcardPLevels } from '../../../../services/student-book-content-flashcards/flashcard-p-levels'
import { StudentCourse } from '../../../types/student-course'
import { patchAll, getFlashcardIdsToReset } from '../student-book-content-flashcard-repository'

export default async (instance, query, studentCourse: StudentCourse) => {
  const ids = await getFlashcardIdsToReset(instance.id, studentCourse, query?.filter)

  await patchAll(ids, { proficiency_level: FlashcardPLevels.minLevel })

  return ids
}
