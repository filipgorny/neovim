import R from 'ramda'
import { findOneOrFail } from '../student-exam-question-repository'
import { validateQuestionBelongsToStudent } from '../validation/validate-question-belongs-to-student'
import { STUDENT_EXAM_STATUS_COMPLETED } from '../../student-exams/student-exam-statuses'
import generatePresignedUrl from '../../../../services/s3/generate-presigned-url'
import { PREVIEW_STUDENT_EMAIL } from '../../../constants'

const transformEntity = R.pipe(
  R.omit(['correct_answer', 'explanation']),
  R.over(
    R.lensProp('originalQuestion'),
    R.omit(['explanation', 'correct_answer', 'answer_distribution'])
  )
)

const evolveQuestion = R.evolve({
  canvas: JSON.parse,
  background_image: generatePresignedUrl,
})

export default async (id, student) => {
  const question = await findOneOrFail({ id }, ['passage.section.exam', 'originalQuestion'])

  validateQuestionBelongsToStudent(student.id)(question)

  const examStatus = R.path(['passage', 'section', 'exam', 'status'])(question)
  const json = evolveQuestion(question)

  return (examStatus === STUDENT_EXAM_STATUS_COMPLETED || student.get('email') === PREVIEW_STUDENT_EMAIL) ? json : transformEntity(json)
}
