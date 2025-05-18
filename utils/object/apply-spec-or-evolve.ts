import * as R from 'ramda'

export const applySpecOrEvolve = spec => R.ifElse(
  R.isNil,
  R.applySpec(spec),
  R.evolve(spec)
)
