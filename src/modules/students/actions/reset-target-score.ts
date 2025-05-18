import * as R from 'ramda'
import { findAllCompletedExams, findOneOrFail } from '../../student-exams/student-exam-repository'
import { calculatePTS } from '../../../../services/student-exams/calculate-projected-target-score'
import { defaultStudentExamScores } from '../../student-exam-scores/default-scores-template'
import * as StudentExamScoresRepository from '../../student-exam-scores/student-exam-scores-repository'

export default async (student, examId) => {
  const exam = await findOneOrFail({
    id: examId,
    student_id: student.id,
  })
  const currentScores = await StudentExamScoresRepository.findOneOrFail({
    exam_type_id: exam.exam_type_id,
    student_id: student.id,
  })

  const allExams = await findAllCompletedExams(exam.exam_type_id)(student)

  const PTS = await calculatePTS(allExams)

  return R.pipeWith(R.andThen)([
    async () => StudentExamScoresRepository.updatePTS(currentScores.id)(defaultStudentExamScores(PTS)),
    R.invoker(0, 'toJSON'),
    R.over(R.lensProp('scores'), JSON.parse),
  ])(true)
}
