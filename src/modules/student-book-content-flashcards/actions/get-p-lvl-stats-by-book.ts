import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { prepareFlashcardProficiencyResponse } from '../../dashboard/actions/flashcard-proficiency'
import { fetchForBookFlashcardProficiencyGraph } from '../student-book-content-flashcard-repository'

export default async (studentBookId: string, student, studentCourse: StudentCourse) => {
  const data = await fetchForBookFlashcardProficiencyGraph(student.id, studentCourse.id, studentBookId)

  return R.pipe(
    prepareFlashcardProficiencyResponse,
    R.head,
    R.prop('data')
  )(data)
}
