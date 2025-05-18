import * as R from 'ramda'
import { getFlashcardsToAnswer as getFlashcardToAnswer } from '../student-book-content-flashcard-repository'
import { flashcardDoesNotBelongToStudentException, throwException } from '../../../../utils/error/error-factory'
import { changeFlashcardPLevel } from '../student-book-content-flashcard-service'
import { StudentCourse } from '../../../types/student-course'
import { earnSaltyBucksForFlashcardAnswer } from '../../../../services/salty-bucks/salty-buck-service'

type Payload = {
  is_correct: boolean
}

const validateFlashcardBelongsToUser = R.when(
  R.isNil,
  () => throwException(flashcardDoesNotBelongToStudentException())
)

export default async (student, id: string, payload: Payload, studentCourse: StudentCourse) => {
  const flashcard = await getFlashcardToAnswer(student.id, id, studentCourse)

  validateFlashcardBelongsToUser(flashcard)

  const oldPLevel = flashcard.proficiency_level
  const newPLevel = await changeFlashcardPLevel(flashcard, payload.is_correct, student.id)

  await earnSaltyBucksForFlashcardAnswer(student.id, id, payload.is_correct, studentCourse)

  return {
    from_p_level: oldPLevel,
    to_p_level: newPLevel,
    has_changed: oldPLevel !== newPLevel,
  }
}
