import R from 'ramda'
import { create, deleteCompletely, findOneInstanceOrFail, findOneOrFail, getMaxCode, remove } from './flashcard-repository'
import { makeDTO } from './dto/flashcard-dto'
import asAsync from '../../../utils/function/as-async'
import mapP from '../../../utils/function/mapp'
import { patchWhere } from '../book-content-flashcards/book-content-flashcard-repository'
import { DELETED_AT } from '@desmart/js-utils'

export const createFlashcard = async (question: string, raw_question: string, question_image: string, explanation: string, explanation_image: string, raw_explanation: string, question_html: string, explanation_html: string) => (
  create(
    makeDTO(question, raw_question, question_image, explanation, raw_explanation, explanation_image, question_html, explanation_html)
  )
)

export const removeFlashcard = async (id: string) => {
  const flashcard = await findOneInstanceOrFail({ id }, ['contents'])
  const contentIds = R.pipe(
    R.invoker(0, 'toJSON'),
    R.prop('contents'),
    // @ts-ignore
    R.pluck('id')
    // @ts-ignore
  )(flashcard)

  await flashcard.contents().detach(contentIds)

  return remove(flashcard.id)
}

export const copyFlashcardById = async (id: string) => (
  R.pipeWith(R.andThen)([
    async () => findOneOrFail({ id }),
    copyFlashcard,
  ])(true)
)

export const copyFlashcard = async (flashcard) => (
  R.pipeWith(R.andThen)([
    asAsync(R.omit(['id'])),
    create,
    R.invoker(0, 'toJSON'),
  ])(flashcard)
)

export const copyAndArchiveFlashcardById = async (id: string) => (
  R.pipeWith(R.andThen)([
    async () => findOneOrFail({ id }),
    copyAndArchiveFlashcard,
  ])(true)
)

export const copyAndArchiveFlashcard = async (flashcard) => (
  R.pipeWith(R.andThen)([
    asAsync(R.omit(['id'])),
    R.set(
      R.lensProp('is_archived'),
      true
    ),
    create,
    R.invoker(0, 'toJSON'),
  ])(flashcard)
)

export const splitFlashcardById = async (id: string) => (
  R.pipeWith(R.andThen)([
    async () => findOneOrFail({ id }, ['contentFlashcards.content.subchapter.chapter.book']),
    splitFlashcard,
  ])(true)
)

export const splitFlashcard = async (flashcard) => (
  R.pipeWith(R.andThen)([
    asAsync(R.prop('contentFlashcards')),
    mapP(
      async (contentFlashcard) => {
        const book = R.path(['content', 'subchapter', 'chapter', 'book'], contentFlashcard)
        let newFlashcard

        if (R.prop('is_archived', book) || R.prop(DELETED_AT, book)) {
          newFlashcard = await copyAndArchiveFlashcardById(flashcard.id)
        } else {
          newFlashcard = await copyFlashcardById(flashcard.id)
        }

        await patchWhere(R.omit(['content'], contentFlashcard), { flashcard_id: newFlashcard.id })

        return newFlashcard
      }
    ),
    async (flashcards) => {
      if (flashcards.length > 0 && (!R.all(R.prop('is_archived'))(flashcards) || (R.all(R.prop('is_archived'))(flashcards) && R.prop('is_archived')(flashcard)))) {
        await deleteCompletely(flashcard.id)
      }
    },
  ])(flashcard)
)
