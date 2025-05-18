import { flashcardBelongsToStudent } from '../../student-book-content-flashcards/student-book-content-flashcard-repository'
import validateStudentFlashcardIsNotArchived from '../validation/validate-student-flashcard-is-not-archived'
import { archiveStudentFlashcard } from '../student-flashcard-archive-service'
import { removeFlashcardFromAllBoxes } from '../../student-box-flashcards/student-box-flashcards-service'

export default async (student_flashcard_id: string, student) => {
  await flashcardBelongsToStudent(student_flashcard_id, student.id)
  await validateStudentFlashcardIsNotArchived(student_flashcard_id)

  await removeFlashcardFromAllBoxes(student_flashcard_id)

  return archiveStudentFlashcard(student_flashcard_id)
}
