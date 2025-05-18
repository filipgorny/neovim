import * as R from 'ramda'

const calculatePR = total => (acc, set) => {
  const [value, frequency] = set
  const cumulative_frequency = frequency + acc

  return [frequency + acc, {
    frequency,
    value,
    cumulative_frequency,
    percentile_rank: (cumulative_frequency - 0.5 * frequency) * 100 / total,
  }]
}

export const percentileRank = (data, total) => (
  R.pipe(
    // @ts-ignore
    R.sortBy(
      // @ts-ignore
      R.prop(0)
    ),
    // @ts-ignore
    R.mapAccum(calculatePR(total), 0),
    R.last
    // @ts-ignore
  )(data)
)
