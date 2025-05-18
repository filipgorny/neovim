import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { prepareFlashcardProficiencyResponse } from '../../dashboard/actions/flashcard-proficiency'
import { fetchForCustomBoxFlashcardProficiencyGraph } from '../student-book-content-flashcard-repository'

export default async (customBoxId: string, student, studentCourse: StudentCourse) => {
  const data = await fetchForCustomBoxFlashcardProficiencyGraph(student.id, studentCourse.id, customBoxId)

  return R.pipe(
    prepareFlashcardProficiencyResponse,
    R.head,
    R.prop('data')
  )(data)
}
