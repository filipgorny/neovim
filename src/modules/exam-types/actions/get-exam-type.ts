import * as R from 'ramda'
import { findOneOrFail } from '../exam-type-repository'

export default async (id: string) => (
  R.pipeWith(R.andThen)([
    async () => findOneOrFail({ id }),
    R.evolve({
      break_definition: JSON.parse,
      question_amount: JSON.parse,
      section_titles: JSON.parse,
      scaled_score_ranges: JSON.parse,
    }),
  ])(true)
)
