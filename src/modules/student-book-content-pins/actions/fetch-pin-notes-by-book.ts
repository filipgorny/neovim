import { pinNotePresenceInBookBySubchapters } from '../student-book-content-pins-repository'

export default async (id: string, query) => (
  pinNotePresenceInBookBySubchapters(id, query)
)
