import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { detachSschema } from '../validation/schema/attach-questions-schema'
import { findOneOrFail } from '../book-content-repository'
import mapP from '../../../../utils/function/mapp'
import { NewBookContentQuestion } from '../../../types/book-conntent-question'
import { removeBookContentQuestion } from '../../book-content-questions/book-content-questions-service'

interface Payload {
  ids: string[]
}

const pickQuestionsToDetach = (idsToDetach: string[], content) => R.pipe(
  R.prop('questions'),
  // @ts-ignore
  R.filter(
    (question: NewBookContentQuestion) => (
      idsToDetach.includes(question.question_id)
    )
  )
  // @ts-ignore
)(content)

export default async (contentId: string, payload: Payload) => {
  validateEntityPayload(detachSschema)(payload)

  const content = await findOneOrFail({ id: contentId }, ['questions'])
  const questions = await pickQuestionsToDetach(payload.ids, content)

  await mapP(
    async (question: NewBookContentQuestion) => (
      removeBookContentQuestion(question.id)
    )
  )(questions)

  return true
}
