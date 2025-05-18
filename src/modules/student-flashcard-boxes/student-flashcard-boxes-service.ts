import { StudentFlashcardBoxDTO } from '../../types/student-flashcard-box'
import { create, patch, deleteRecord } from './student-flashcard-boxes-repository'

export const createEntity = async (dto: StudentFlashcardBoxDTO) => (
  create(dto)
)

export const patchEntity = async (id: string, dto: {}) => (
  patch(id, dto)
)

export const deleteEntity = async (id: string) => (
  deleteRecord(id)
)
