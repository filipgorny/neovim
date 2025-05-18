import { int } from '@desmart/js-utils'
import * as R from 'ramda'

export const getMinMaxScoresFromTemplate = R.pipe(
  R.pluck('scaled_score'),
  R.sort(R.subtract),
  R.applySpec({
    min: R.pipe(
      R.head,
      Number
    ),
    max: R.pipe(
      R.takeLast(1),
      R.head,
      Number
    ),
  })
)

const getScoresFromType = R.pipe(
  R.propOr([], 'scaledScoreDefinitions'),
  R.sortBy(
    R.prop('order')
  ),
  R.map(
    R.pipe(
      R.path(['template', 'scores']),
      getMinMaxScoresFromTemplate
    )
  )
)

export const getMinScoresFromType = type => R.pipe(
  getScoresFromType,
  R.pluck('min')
)(type)

export const getMaxScoresFromType = type => R.pipe(
  getScoresFromType,
  R.pluck('max')
)(type)

export const getMinMaxScoresFromType = (type, order) => (
  R.pipe(
    R.propOr([], 'scaled_score_ranges'),
    JSON.parse,
    obj => obj[`section_${order}`],
    R.map(int),
    R.zipObj(['min', 'max'])
  )(type)
)
