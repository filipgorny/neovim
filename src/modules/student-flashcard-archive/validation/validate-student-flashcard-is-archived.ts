import { studentFlashcardIsNotArchivedException, throwException } from '../../../../utils/error/error-factory'
import { findOne } from '../student-flashcard-archive-repository'

export default async (student_flashcard_id: string) => {
  const flashcardArchiveRecord = await findOne({ student_flashcard_id })

  if (!flashcardArchiveRecord) {
    throwException(studentFlashcardIsNotArchivedException())
  }
}
