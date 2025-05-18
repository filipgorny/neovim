import R from 'ramda'
import bcrypt from 'bcryptjs'

export default R.curry(
  (string, hash) => bcrypt.compareSync(string, hash)
)
