import { findOne as findFlashcardBox, findOneOrFail as findFlashcardBoxOrFail } from '../student-flashcard-boxes-repository'
import { findOneOrFail as findStudentBook } from '../../student-books/student-book-repository'
import { customException, throwException } from '@desmart/js-utils'

export const validateBoxBelongsToStudent = async (id: string, student_course_id: string) => (
  findFlashcardBoxOrFail({
    id,
    student_course_id,
  })
)

export const validateBookBelongsToStudent = async (student_book_id: string, student_id: string) => (
  findStudentBook({
    id: student_book_id,
    student_id,
  }, [])
)

export const validateTitleIsUnique = async (student_course_id: string, title: string, excludeId?: string) => {
  const box = await findFlashcardBox({
    student_course_id,
    title,
  })

  if (excludeId && box && box.id === excludeId) {
    return
  }

  if (box) {
    throwException(
      customException('flashcard-box.already-exists', 409, 'Flashcard box with given title already exists')
    )
  }
}
