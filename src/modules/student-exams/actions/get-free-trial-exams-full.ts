import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { findCourseAttachedFreeTrialExams, findFirstChapterFreeTrialExams, findBookAttachedFreeTrialExams } from '../student-exam-repository'

export default async (studentCourse: StudentCourse) => {
  const [chapterExams, courseAttachedExams, bookAttachedExams] = await Promise.all([
    findFirstChapterFreeTrialExams(studentCourse.id),
    findCourseAttachedFreeTrialExams(studentCourse.id),
    findBookAttachedFreeTrialExams(studentCourse.id),
  ])

  const allExams = [...chapterExams, ...courseAttachedExams, ...bookAttachedExams]

  return R.map(
    R.evolve({
      exam_length: JSON.parse,
    })
  )(allExams)
}
