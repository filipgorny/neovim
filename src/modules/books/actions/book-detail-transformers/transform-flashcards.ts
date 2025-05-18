import * as R from 'ramda'
import generateStaticUrl from '../../../../../services/s3/generate-static-url'

export const transformFlashcards = R.when(
  R.has('flashcards'),
  R.over(
    R.lensProp('flashcards'),
    R.map(
      R.evolve({
        question_image: value => value ? generateStaticUrl(value) : null,
        explanation_image: value => value ? generateStaticUrl(value) : null,
      })
    )
  )
)
