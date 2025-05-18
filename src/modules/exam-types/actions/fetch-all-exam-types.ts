import R from 'ramda'
import { find } from '../exam-type-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

const findExamTypes = async (query) => (
  find(query, query.filter)
)

export default async (query) => (
  R.pipeWith(R.andThen)([
    findExamTypes,
    R.over(
      R.lensProp('data'),
      R.pipe(
        collectionToJson,
        R.map(
          R.evolve({
            break_definition: JSON.parse,
            question_amount: JSON.parse,
            section_titles: JSON.parse,
            scaled_score_ranges: JSON.parse,
          })
        )
      )
    ),
  ])(query)
)
