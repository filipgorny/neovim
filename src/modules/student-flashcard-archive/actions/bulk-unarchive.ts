import mapP from '@desmart/js-utils/dist/function/mapp'
import unarchiveStudentFlashcard from './unarchive-student-flashcard'

export default async (student_flashcard_ids: string[], student) => (
  mapP(async (id: string) => unarchiveStudentFlashcard(id, student))(student_flashcard_ids)
)
