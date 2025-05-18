import { deleteNotesBySubchapterId } from './student-book-subchapter-notes-repository'

export const deleteBySubchapterId = async (content_id: string) => (
  deleteNotesBySubchapterId(content_id)
)
