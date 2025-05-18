import mapP from '@desmart/js-utils/dist/function/mapp'
import * as R from 'ramda'
import { findStudentBookById } from '../student-books/student-book-service'

export const transformFlashcardSnapshotObject = async (snapshotObject) => {
  await mapP(
    async (sb) => {
      const studentBook = await findStudentBookById(sb.id, ['book'])
      const originalBook = studentBook.book
      if (originalBook.flashcards_accessible) {
        return
      }
      snapshotObject.amount -= sb.amount
      sb.amount = 0
      sb.chapters.forEach(chapter => {
        chapter.amount = 0
      })
    }
  )(snapshotObject.books)

  return snapshotObject
}

export const transformFlashcardSnapshot = async (flashcard_snapshot: string): Promise<string> => {
  const snapshotJSON = JSON.parse(flashcard_snapshot)

  await transformFlashcardSnapshotObject(snapshotJSON)

  return JSON.stringify(snapshotJSON)
}
