// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken')
import env from '../../utils/env'

const TOKEN_EXPIRES_IN = '30m'
const DEVELOP_TOKEN_EXPIRES_IN = '3600m'

const tokenConfig = {
  expiresIn: env('APP_ENV') === 'development' ? DEVELOP_TOKEN_EXPIRES_IN : TOKEN_EXPIRES_IN,
}

export default (user, additional = {}) => (
  jwt.sign({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: new Date(),
    ...additional,
  }, env('APP_KEY'), tokenConfig)
)
