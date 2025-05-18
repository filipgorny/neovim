import { shuffleStudentFlashcards } from '../student-book-content-flashcard-service'

export default async (studentId) => (
  shuffleStudentFlashcards(studentId)
)
