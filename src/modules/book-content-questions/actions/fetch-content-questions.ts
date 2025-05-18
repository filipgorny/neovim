import R from 'ramda'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { find } from '../book-content-questions-repository'

const defaultQuery = ({
  order: {
    by: 'order',
    dir: 'asc',
  },
  limit: {
    page: 1,
    take: 10,
  },
})

const prepareQuery = query => R.mergeDeepLeft(
  query,
  defaultQuery
)

const evolveQuestion = R.evolve({
  answer_definition: JSON.parse,
  correct_answers: JSON.parse,
})

export default async (content_id, query) => R.pipeWith(R.andThen)([
  async () => find(prepareQuery(query), { content_id }),
  R.over(
    R.lensProp('data'),
    R.pipe(
      collectionToJson,
      R.map(evolveQuestion)
    )
  ),
])(true)
