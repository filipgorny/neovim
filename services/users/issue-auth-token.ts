import jwt from 'jsonwebtoken'
import env from '../../utils/env'

const TOKEN_EXPIRES_IN = '24h'

export default (user, additional = {}) => () => (
  jwt.sign({
    id: user.id,
    email: user.email,
    createdAt: new Date(),
    ...additional,
  }, env('APP_KEY'), { expiresIn: TOKEN_EXPIRES_IN })
)
