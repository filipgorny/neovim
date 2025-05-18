import R from 'ramda'

export default propDefinition => R.converge(
  R.mergeRight,
  [
    R.pipe(
      R.pick(Object.keys(propDefinition)),
      R.values,
      // @ts-ignore
      R.zipObj(Object.values(propDefinition))
    ),
    R.omit(Object.keys(propDefinition))
  ]
)
