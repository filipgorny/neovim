import mapP from '@desmart/js-utils/dist/function/mapp'
import { StudentBoxFlashcard, StudentBoxFlashcardDTO } from '../../types/student-box-flashcard'
import { create, deleteByFlashcardId, deleteRecord, findOne } from './student-box-flashcards-repository'

export const addFlashcardToBox = async (dto: StudentBoxFlashcardDTO): Promise<StudentBoxFlashcard> => {
  const boxFlashcard = await findOne({
    student_flashcard_box_id: dto.student_flashcard_box_id,
    student_flashcard_id: dto.student_flashcard_id,
  })

  return boxFlashcard || create(dto)
}

export const removeFlashcardFromBox = async (dto: StudentBoxFlashcardDTO): Promise<void> => {
  const boxFlashcard = await findOne({
    student_flashcard_box_id: dto.student_flashcard_box_id,
    student_flashcard_id: dto.student_flashcard_id,
  })

  if (boxFlashcard) {
    await deleteRecord(boxFlashcard.id)
  }
}

export const removeFlashcardsFromBoxInBulk = async (box_id: string, flashcard_ids: string[]): Promise<void> => {
  await mapP(
    async (id: string) => removeFlashcardFromBox({
      student_flashcard_box_id: box_id,
      student_flashcard_id: id,
    })
  )(flashcard_ids)
}

export const removeFlashcardFromAllBoxes = async (student_flashcard_id: string): Promise<void> => {
  await deleteByFlashcardId(student_flashcard_id)
}
