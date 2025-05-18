import R from 'ramda'
import { findQuestions } from '../question-repository'

export default async (query: any) => R.pipeWith(R.andThen)([
  async () => findQuestions(query),
  R.over(
    R.lensProp('data'),
    R.map(
      R.evolve({
        answer_definition: JSON.parse,
        correct_answers: JSON.parse,
        question_content_delta_object: JSON.parse,
        explanation_delta_object: JSON.parse,
        tags: value => value ? JSON.parse(value) : null,
      })
    )
  ),
])(true)
