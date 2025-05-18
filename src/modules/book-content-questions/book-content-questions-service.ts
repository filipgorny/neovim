import * as R from 'ramda'
import mapP from '../../../utils/function/mapp'
import { copyAndArchiveQuestionById } from '../questions/question-service'
import { remove, findOneOrFail, fixQuestionOrderAfterDeleting, removeWhere, create } from './book-content-questions-repository'

export const removeBookContentQuestion = async (id: string) => {
  const question = await findOneOrFail({ id })
  const result = await remove(id)

  await fixQuestionOrderAfterDeleting(question.subchapter_id, question.subchapter_order)

  return result
}

export const removeQuestionsByBookContentId = async (content_id: string) => {
  await removeWhere({ content_id })
}

export const createBookContentQuestion = async (
  content_id: string,
  question_id: string,
  order: number,
  subchapter_order: number,
  subchapter_id: string
) => (
  create({
    content_id,
    question_id,
    order,
    subchapter_order,
    subchapter_id,
  })
)

export const createBookContentQuestionsFromOriginal = async (contentId, originals) => (
  mapP(
    R.pipeWith(R.andThen)([
      async (question) => {
        const newQuestion = await copyAndArchiveQuestionById(question.question_id)

        return [contentId, newQuestion.id, question.order, question.subchapter_order, question.subchapter_id]
      },
      R.apply(createBookContentQuestion),
    ])
  )(originals)
)
