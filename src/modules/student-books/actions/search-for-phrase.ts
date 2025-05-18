import * as R from 'ramda'
import { takeExcerpt } from '@desmart/js-utils/dist/string'
import { evalProp } from '@desmart/js-utils/dist/object'
import { searchForPhraseInBook } from '../student-book-repository'

type Payload = {
  search: string
}

const doesPhraseMatch = (phrase, fieldName) => evalProp(`${fieldName}_match`, R.pipe(
  R.propOr('', `${fieldName}_raw`),
  R.match(phrase),
  R.length,
  Boolean
))

export const extractPhrase = phrase => R.pipe(
  R.evolve({
    content_raw: takeExcerpt(phrase),
    resource_raw: takeExcerpt(phrase),
  }),
  doesPhraseMatch(phrase, 'content'),
  doesPhraseMatch(phrase, 'resource')
)

export default async (studentBookId: string, payload: Payload) => (
  R.pipeWith(R.andThen)([
    async () => searchForPhraseInBook(studentBookId, payload.search),
    R.over(
      R.lensProp('data'),
      R.map(extractPhrase(payload.search))
    ),
    R.over(
      R.lensProp('data'),
      R.map(
        R.over(
          R.lensProp('tag'),
          R.pipe(
            JSON.parse,
            R.head
          )
        )
      )
    ),
  ])(true)
)
