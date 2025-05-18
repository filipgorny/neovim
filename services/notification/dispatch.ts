import R from 'ramda'

export default R.curry((getDriver, name, driversToUse, payload) => {
  R.pipe(
    R.map(getDriver),
    R.forEach(dispatch => dispatch(name, payload))
  )(driversToUse)
})
