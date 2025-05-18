export type StudentBoxFlashcard = {
  id: string,
  student_flashcard_box_id: string,
  student_flashcard_id: string,
}

export type StudentBoxFlashcardDTO = Omit<StudentBoxFlashcard, 'id'>
