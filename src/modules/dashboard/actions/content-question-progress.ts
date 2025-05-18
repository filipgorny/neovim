import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { fetchContentQuestionProgressByBooks, fetchContentQuestionProgressByCourse } from '../../student-book-content-questions/student-book-content-question-repository'

export default async (student, studentCourse: StudentCourse) => {
  const [progressByBooks, progressOverall] = await Promise.all([
    fetchContentQuestionProgressByBooks(student.id, studentCourse.id),
    fetchContentQuestionProgressByCourse(student.id, studentCourse.id),
  ])

  return R.concat(progressOverall, progressByBooks)
}
