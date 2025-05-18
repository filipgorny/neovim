import * as R from 'ramda'
import { StudentCourse } from '../../../types/student-course'
import { findFreeTrialExams } from '../student-exam-repository'

export default async (studentCourse: StudentCourse) => {
  const freeTrialExamIds = await findFreeTrialExams(studentCourse.id)

  return R.pluck('id', freeTrialExamIds)
}
