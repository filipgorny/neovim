import R from 'ramda'
import getStudentExams from './get-student-exams'
export default async (user) => {
  const exams = await getStudentExams(user.id, {})

  return R.pipe(
    R.prop('data'),
    R.find(exam => exam.title === 'Standalone'),
    R.propOr([], 'exams')
  )(exams)
}
