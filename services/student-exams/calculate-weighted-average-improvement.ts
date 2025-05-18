/***
 Weighted average improvement (WAI)

 z1 = 1st exam score, z2 = 2nd exam score, z3 = 3rd exam score, zi = ith exam score

 (zi+1 – zi) = difference between the ith exam score and the i + 1 exam score.

 n + 1 = number of exam scores [If there are 5 exam scores, there are only 4 score improvements.]

 The weighted average improvement X is given by:

 X = sum([i=1; n] => i * (zi+1 - zi)) / sum([i=1; n] => i)
 */

import * as R from 'ramda'

const calculateDifferences = R.pipe(
  R.aperture(2),
  R.map(
    R.pipe(
      R.reverse,
      // @ts-ignore
      R.apply(R.subtract)
    )
  )
)

const multiplyByWeights = R.addIndex(R.map)(
  (value: number, n) => (n + 1) * value
)

const sumWeightedImprovements = R.pipe(
  calculateDifferences,
  multiplyByWeights,
  // @ts-ignore
  R.sum
)

const sumWeights = R.pipe(
  R.aperture(2),
  R.addIndex(R.map)(
    (value, n) => n + 1
  ),
  // @ts-ignore
  R.sum
)

const roundToThirdPlace = R.pipe(
  R.multiply(1000),
  Math.round,
  R.divide(R.__, 1000)
)

const calculateWAI = R.pipe(
  R.juxt([
    sumWeightedImprovements,
    sumWeights,
  ]),
  // @ts-ignore
  R.apply(R.divide),
  roundToThirdPlace
)

export const calculateWeightedAverageImprovement = (scores: number[]): number => (
  R.ifElse(
    R.propSatisfies(R.gte(1), 'length'),
    R.always(0),
    calculateWAI
  )(scores)
)
