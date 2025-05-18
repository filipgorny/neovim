import * as R from 'ramda'

export const wrapProps = (propWrap, list) => R.pipe(
  R.juxt([
    R.pipe(
      R.identity,
      R.omit(list)
    ),
    R.pipe(
      R.pick(list),
      R.objOf(propWrap)
    )
  ]),
  R.mergeAll
)
