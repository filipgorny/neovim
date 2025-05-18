import R from 'ramda'

export default (value: string): string => R.converge(
  R.concat,
  [
    R.pipe(
      R.head,
      R.toUpper
    ),
    R.tail,
  ]
)(value)
