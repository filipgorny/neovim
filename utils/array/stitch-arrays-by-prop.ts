import * as R from 'ramda'

export const stitchArraysByProp = R.curry(
  (prop, a, b) => R.map(
    (itemA: {}) => {
      const itemB = R.find(R.propEq(prop, itemA[prop]))(b)

      return { ...itemA, ...itemB }
    }
  )(a)
)

export const stitchArraysByPropStrict = R.curry(
  (prop, a, b) => R.pipe(
    R.map(
      (itemA: {}) => {
        const itemB = R.find(R.propEq(prop, itemA[prop]))(b)

        return itemB ? { ...itemA, ...itemB } : null
      }
    ),
    // @ts-ignore
    R.filter(R.identity)
  )(a)
)
