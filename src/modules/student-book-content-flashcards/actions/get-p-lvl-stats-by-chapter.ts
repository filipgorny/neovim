import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { prepareFlashcardProficiencyResponse } from '../../dashboard/actions/flashcard-proficiency'
import { fetchForChapterFlashcardProficiencyGraph } from '../student-book-content-flashcard-repository'

export default async (chapterId: string, student, studentCourse: StudentCourse) => {
  const data = await fetchForChapterFlashcardProficiencyGraph(student.id, studentCourse.id, chapterId)

  return R.pipe(
    prepareFlashcardProficiencyResponse,
    R.head,
    R.prop('data')
  )(data)
}
