import * as R from 'ramda'

export const filterByBookChapterId = book_chapter_id => R.pipe(
  R.map(
    R.over(
      R.lensProp('days'),
      R.filter(
        R.propEq('book_chapter_id', book_chapter_id)
      )
    )
  ),
  R.reject(
    R.propSatisfies(R.isEmpty, 'days')
  )
)
