import * as R from 'ramda'
import mapP from '../../../utils/function/mapp'
import { copyAndArchiveFlashcardById } from '../flashcards/flashcard-service'
import { create, removeWhere } from './book-content-flashcard-repository'

export const createBookContentFlashcard = async (content_id: string, flashcard_id: string) => (
  create({
    content_id,
    flashcard_id,
  })
)

export const createBookContentFlashcardsFromOriginal = async (contentId, originals) => (
  mapP(
    R.pipeWith(R.andThen)([
      async flashcard => copyAndArchiveFlashcardById(flashcard.id),
      R.juxt([
        R.always(contentId),
        R.prop('id'),
      ]),
      R.apply(createBookContentFlashcard),
    ])
  )(originals)
)

export const removeBookContentFlahscardsByContentId = async (contentId: string) => (
  removeWhere({ content_id: contentId })
)
