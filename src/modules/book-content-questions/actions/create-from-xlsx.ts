import R from 'ramda'
import { fileSchema } from '../validation/schema/create-content-questions-schema'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { buildContentQuestionsFromXls } from '../../../../services/book-content-questions/build-content-questions-from-xls'
import { findOneOrFail } from '../../book-contents/book-content-repository'
// import { createBookContentQuestion } from '../book-content-questions-service'
import { BookContentQuestion } from '../../../types/book-conntent-question'

const getNextOrderFromBookContent = content => (
  R.pipe(
    R.prop('questions'),
    // @ts-ignore
    R.length,
    R.inc
    // @ts-ignore
  )(content)
)

const createBookContentQuestion = (...arg) => (
  true
)

export default async (contentId, files) => {
  validateFilesPayload(fileSchema)(files)

  const { file } = files
  const content = await findOneOrFail({ id: contentId }, ['questions'])
  const contentQuestion: BookContentQuestion = await buildContentQuestionsFromXls(file)
  const order = getNextOrderFromBookContent(content)

  return createBookContentQuestion(order, contentQuestion.question, content.id, contentQuestion.explanation, contentQuestion.answer_definition, contentQuestion.correct_answers)
}
