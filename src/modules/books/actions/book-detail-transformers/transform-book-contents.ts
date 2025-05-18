import * as R from 'ramda'
import { mapContent } from '../../../book-contents/actions/fetch-book-contents'

export const transformBookContents = R.when(
  R.has('book_contents'),
  R.over(
    R.lensProp('book_contents'),
    R.map(mapContent)
  )
)
