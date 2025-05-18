import R from 'ramda'

const mapP = fn => async list => (
  Promise.all(
    R.map(fn)(list)
  )
)

export default mapP
