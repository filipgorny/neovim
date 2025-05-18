import * as R from 'ramda'
import { takeExcerpt } from '@desmart/js-utils/dist/string'
import { evalProp } from '@desmart/js-utils/dist/object'
import { searchForPhraseInCourse } from '../student-course-repository'
import { extractPhrase } from '../../student-books/actions/search-for-phrase'

type Payload = {
  search: string
}

export default async (studentCourseId: string, payload: Payload) => (
  R.pipeWith(R.andThen)([
    async () => searchForPhraseInCourse(studentCourseId, payload.search),
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
