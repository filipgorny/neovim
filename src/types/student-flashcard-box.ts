export type StudentFlashcardBox = {
  id: string,
  student_course_id: string,
  student_book_id: string,
  title: string,
}

export type StudentFlashcardBoxDTO = Omit<StudentFlashcardBox, 'id'>
