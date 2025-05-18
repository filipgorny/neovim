import R from 'ramda'
import { codeFromFlashcard } from '../../../../services/flashcards/code-from-flashcard'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { findFlashcards } from '../flashcard-repository'

const defaultQuery = ({
  limit: {
    page: 1,
    take: 16,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

export default async (query) => R.pipeWith(R.andThen)([
  async () => findFlashcards(prepareQuery(query), query.filter),
  R.over(
    R.lensProp('data'),
    R.map(
      R.evolve({
        question_image: value => value ? generateStaticUrl(value) : null,
        explanation_image: value => value ? generateStaticUrl(value) : null,
        code: codeFromFlashcard,
      })
    )
  ),
])(true)
