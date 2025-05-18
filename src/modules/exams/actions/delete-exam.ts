import { deleteExam } from '../exam-service'
import { findOneOrFail } from '../exam-repository'

export default async (id: string, user) => {
  const exam = await findOneOrFail({ id })

  return deleteExam(exam.id, exam.title, exam.external_id, user.id)
}
