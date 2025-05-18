import * as R from 'ramda'

export const getScoresByOrder = (order, currentScores) => R.pipe(
  R.prop('scores'),
  JSON.parse,
  R.sortBy(R.prop('order')),
  R.nth(order),
  R.prop('target_score')
)(currentScores)

export const findCurrentSectionScore = (order, currentScores) => getScoresByOrder(order, currentScores)

export const findCurrentExamScore = currentScores => getScoresByOrder(0, currentScores)
