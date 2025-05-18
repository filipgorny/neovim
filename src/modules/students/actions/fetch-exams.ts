import R from 'ramda'
import renameProps from '../../../../utils/object/rename-props'
import { StudentCourse } from '../../../types/student-course'
import { findExams, findFreeTrialExams } from '../../student-exams/student-exam-repository'

const hydrateItem = R.pipe(
  R.evolve({
    exam_length: JSON.parse,
  }),
  renameProps({ is_free_trial_global: 'is_available' })
)

export default async (student, query, studentCourse: StudentCourse) => {
  if (studentCourse) {
    const ft = await findFreeTrialExams(studentCourse.id)
    console.log(ft)
  }

  return R.pipeWith(R.andThen)([
    async () => findExams(student.id, query, query.filter, false, studentCourse?.id),
    R.over(
      R.lensProp('data'),
      R.map(hydrateItem)
    ),
  ])(true)
}
