import * as R from 'ramda'

const answerDefault = answer => (
  {
    [answer]: {
      amount: 0,
      percentage: 0,
    },
  }
)

const getAnswerDistributionTemplate = R.pipe(
  R.prop('answer_definition'),
  JSON.parse,
  R.keys,
  R.map(answerDefault),
  R.mergeAll
)

export const getAnswerDistribution = R.ifElse(
  R.propSatisfies(
    R.isNil, 'answer_distribution'
  ),
  getAnswerDistributionTemplate,
  R.prop('answer_distribution')
)
