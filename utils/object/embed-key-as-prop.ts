import * as R from 'ramda'

export const embedKeyAsProp = prop => data => (
  R.pipe(
    R.keys,
    R.map(
      id => (
        { ...data[id], [prop]: id }
      )
    )
  )(data)
)
