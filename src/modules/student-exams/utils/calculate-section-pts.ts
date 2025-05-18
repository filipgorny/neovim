import * as R from 'ramda'

export const calculateSectionPTS = (sectionIndex, sectionMaxScore) => sections => R.pipe(
  R.map<object[], object[]>(
    R.nth(sectionIndex)
  ),
  R.pluck('scaled_score'),
  R.when(
    R.isEmpty,
    R.always([sectionMaxScore])
  ),
  R.juxt([
    R.sum,
    R.length,
  ]),
  // @ts-ignore
  R.apply(
    R.divide
  ),
  Math.round
  // @ts-ignore
)(sections)
