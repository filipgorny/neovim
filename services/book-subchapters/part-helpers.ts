import * as R from 'ramda'
import { BookChapter } from '../../src/types/book-chapter'

export const getCurrentPartFromChapter = (chapter: BookChapter) => (
  R.pipe(
    R.propOr([], 'subchapters'),
    // @ts-ignore
    R.sortBy(
      R.prop('order')
    ),
    R.ifElse(
      R.isEmpty,
      R.always(0),
      R.pipe(
        R.last,
        R.propOr(1, 'part')
      )
    )
    // @ts-ignore
  )(chapter)
)

export const getNextPartFromChapter = (chapter: BookChapter) => (
  R.pipe(
    getCurrentPartFromChapter,
    R.inc
  )(chapter)
)
