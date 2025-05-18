import { fileSchema } from '../validation/schema/create-content-questions-schema'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { buildContentQuestionsFromXls } from '../../../../services/book-content-questions/build-content-questions-from-xls'
import { findOneOrFail } from '../book-content-questions-repository'
// import { updateBookContentQuestion } from '../book-content-questions-service'
import { BookContentQuestion } from '../../../types/book-conntent-question'

const updateBookContentQuestion = (questionId) => (...arg) => (
  true
)

export default async (id, files) => {
  validateFilesPayload(fileSchema)(files)

  const { file } = files
  const question = await findOneOrFail({ id })
  const contentQuestion: BookContentQuestion = await buildContentQuestionsFromXls(file)

  return updateBookContentQuestion(question.id)(question.order, contentQuestion.question, question.content_id, contentQuestion.explanation, contentQuestion.answer_definition, contentQuestion.correct_answers)
}
