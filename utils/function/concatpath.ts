import * as R from 'ramda'

const concatPath = (arrPath, restPath = [], f = R.identity) => elem => (
  R.ifElse(
    R.isEmpty,
    () => f(R.path(restPath, elem)),
    R.pipe(
      R.head,
      R.ifElse(
        R.propEq(R.__, undefined, elem),
        R.always([]),
        R.prop(R.__, elem)
      ),
      R.map(
        concatPath(R.slice(1, Infinity, arrPath), restPath, f)
      ),
      arrays => [].concat(...arrays)
    )
  )(arrPath)
)

export default concatPath
