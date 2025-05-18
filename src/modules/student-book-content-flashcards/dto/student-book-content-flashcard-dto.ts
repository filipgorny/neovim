export type StudentBookContentFlashcardDTO = {
  content_id: string,
  original_flashcard_id: string,
  proficiency_level: number,
}

export const makeDTO = (
  content_id: string,
  original_flashcard_id: string,
  proficiency_level: number
): StudentBookContentFlashcardDTO => ({
  content_id,
  original_flashcard_id,
  proficiency_level,
})

export default StudentBookContentFlashcardDTO
