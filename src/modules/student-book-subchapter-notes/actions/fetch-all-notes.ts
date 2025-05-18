import { fetchNotesByStudentIdAndSubchapterId } from '../student-book-subchapter-notes-repository'

export default async (studentId: string, subchapterId: string) => (
  fetchNotesByStudentIdAndSubchapterId({ studentId, subchapterId, select: ['raw', 'delta_object', 'id', 'updated_at'] })
)
