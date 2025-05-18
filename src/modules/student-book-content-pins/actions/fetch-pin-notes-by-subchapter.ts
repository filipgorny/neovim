import { fetchPinNotesBySubchapters } from '../student-book-content-pins-repository'

export default async (book_id: string, subchapter_id: string, query) => (
  fetchPinNotesBySubchapters(book_id, subchapter_id, query)
)
