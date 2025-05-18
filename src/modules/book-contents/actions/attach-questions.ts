import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/attach-questions-schema'
import { findOneOrFail } from '../book-content-repository'
import { findBySubchapterId, upsertQuestions } from '../../book-content-questions/book-content-questions-repository'
import { v4 as uuid } from 'uuid'
import { NewBookContentQuestion } from '../../../types/book-conntent-question'
import { findQuestionsWithIds } from '../../questions/question-repository'
import { removeBookContentQuestion } from '../../book-content-questions/book-content-questions-service'
import mapP from '../../../../utils/function/mapp'

interface Payload {
  ids: string[]
}

const getLastOrderFromContent = content => R.pipe(
  R.prop('questions'),
  R.pluck('order'),
  R.ifElse(
    R.isEmpty,
    R.always(0),
    R.reduce(R.max, -Infinity)
  ),
  R.inc
)(content)

const getLastOrderFromSubchapterByContent = async content => (
  R.pipeWith(R.andThen)([
    async content => findBySubchapterId(content.subchapter_id),
    R.sortBy(R.prop('subchapter_order')),
    R.pluck('subchapter_order'),
    R.ifElse(
      R.isEmpty,
      R.always(0),
      R.reduce(R.max, -Infinity)
    ),
    R.inc,
  ])(content)
)

const prepareQuestions = (contentId: string, subchapterId: string, nextOrder: number) => (ids: string[]): NewBookContentQuestion[] => (
  R.addIndex(R.map)(
    (val: string, idx: number): NewBookContentQuestion => ({
      id: uuid(),
      order: nextOrder + idx,
      subchapter_order: nextOrder + idx,
      subchapter_id: subchapterId,
      question_id: val,
      content_id: contentId,
    })
  )(ids)
)

export default async (contentId: string, payload: Payload) => {
  validateEntityPayload(schema)(payload)

  const content = await findOneOrFail({ id: contentId }, ['questions'])
  const questionIdsAlreadyAttached = R.pluck('question_id')(content.questions)
  const questions = await findQuestionsWithIds(payload.ids)
  const nextOrder = await getLastOrderFromSubchapterByContent(content)

  const questionsToDetach = R.reject(
    (question: NewBookContentQuestion) => payload.ids.includes(question.question_id)
  )(content.questions)
  const idsToAttach = R.pipe(
    R.pluck('id'),
    R.reject(
      value => questionIdsAlreadyAttached.includes(value)
    ),
    R.map(String)
  )(questions)

  const attachedQuestions = prepareQuestions(content.id, content.subchapter_id, nextOrder)(idsToAttach)

  await mapP(
    async (question: NewBookContentQuestion) => (
      removeBookContentQuestion(question.id)
    )
  )(questionsToDetach)

  if (!R.isEmpty(idsToAttach)) {
    await upsertQuestions(attachedQuestions)
  }

  return true
}
