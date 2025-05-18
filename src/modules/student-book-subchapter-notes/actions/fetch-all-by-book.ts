import { fetchNotesByStudentBook } from '../student-book-subchapter-notes-repository'

export default async (studentId: string, id: string, query) => (
  fetchNotesByStudentBook(query, id, studentId)
)
