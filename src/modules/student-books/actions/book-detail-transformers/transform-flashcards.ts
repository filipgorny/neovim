import * as R from 'ramda'
import { shuffleArray } from '@desmart/js-utils'
import generateStaticUrl from '../../../../../services/s3/generate-static-url'

export const transformFlashcards = R.when(
  R.has('flashcards'),
  R.over(
    R.lensProp('flashcards'),
    R.pipe(
      R.map(
        R.evolve({
          question_image: generateStaticUrl,
          explanation_image: generateStaticUrl,
        })
      ),
      shuffleArray
    )
  )
)
