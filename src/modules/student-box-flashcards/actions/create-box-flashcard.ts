import { StudentBoxFlashcard } from '../../../types/student-box-flashcard'
import { addFlashcardToBox } from '../student-box-flashcards-service'
import { validateFlashcardBelongsToStudent } from '../validation/validate-flashcard-belongs-to-student'

export default async (user, box_id: string, student_flashcard_id: string): Promise<StudentBoxFlashcard> => {
  await validateFlashcardBelongsToStudent(student_flashcard_id, user.id)

  return addFlashcardToBox({
    student_flashcard_box_id: box_id,
    student_flashcard_id: student_flashcard_id,
  })
}
