import * as R from 'ramda'
import { validateQuestionBelongsToStudent } from '../validation/validate-question-belongs-to-student'
import { findOneOrFail } from '../student-exam-question-repository'
import { changeAnswer } from '../student-exam-question-service'
import { validateExpiredExam } from '../../student-exams/validation/validate-expired-exam'
import { findOne as findExamType } from '../../exam-types/exam-type-repository'
import { areStringsSame } from '../../../../utils/string/are-strings-same'
import { earnSaltyBucksForQuestionAnswer } from '../../../../services/salty-bucks/salty-buck-service'
import { StudentCourse } from '../../../types/student-course'

const validateExamViaQuestion = R.pipe(
  R.path(['passage', 'section', 'exam']),
  validateExpiredExam
)

const getExamType = async question => {
  const examTypeId = R.path(['passage', 'section', 'exam', 'exam_type_id'])(question)

  const examType = await findExamType({ id: examTypeId })

  return examType.type
}

const isCorrectAnswer = (question, answer) => areStringsSame(answer, question.correct_answer)

const questionAnsweredFirstTime = R.propSatisfies(R.isNil, 'answer')

export default async (id, student, { answer }, studentCourse?: StudentCourse) => {
  const question = await findOneOrFail({ id }, ['passage.section.exam', 'originalQuestion'])

  validateExamViaQuestion(question)
  validateQuestionBelongsToStudent(student.id)(question)

  const examType = await getExamType(question)
  const studentExamId = R.path(['passage', 'section', 'exam', 'id'])(question)

  const hasCourses = R.pathOr(false, ['attributes', 'has_courses'], student)

  if (hasCourses) {
    await R.when(
      questionAnsweredFirstTime,
      async () => earnSaltyBucksForQuestionAnswer(student.id, studentExamId, examType, isCorrectAnswer(question, answer), question, studentCourse)
    )(question)
  }

  return changeAnswer(question, answer)
}
