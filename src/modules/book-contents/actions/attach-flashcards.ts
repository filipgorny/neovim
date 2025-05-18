import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/attach-flashcards-schema'
import asAsync from '../../../../utils/function/as-async'
import { findFlashcardsWithIds } from '../../flashcards/flashcard-repository'
import { attachFlashcards } from '../book-content-service'

const prepareAndAttachFlashcards = id => async payload => {
  const { ids } = payload
  const flashcards = await findFlashcardsWithIds(ids)

  return attachFlashcards(id, R.pluck('id')(flashcards))
}

export default async (id, payload) => (
  R.pipeWith(R.andThen)([
    asAsync(validateEntityPayload(schema)),
    prepareAndAttachFlashcards(id),
  ])(payload)
)
