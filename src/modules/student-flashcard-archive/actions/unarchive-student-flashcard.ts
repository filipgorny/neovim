import { flashcardBelongsToStudent } from '../../student-book-content-flashcards/student-book-content-flashcard-repository'
import { unarchiveStudentFlashcard } from '../student-flashcard-archive-service'
import validateStudentFlashcardIsArchived from '../validation/validate-student-flashcard-is-archived'

export default async (student_flashcard_id: string, student) => {
  await flashcardBelongsToStudent(student_flashcard_id, student.id)
  await validateStudentFlashcardIsArchived(student_flashcard_id)

  return unarchiveStudentFlashcard(student_flashcard_id)
}
