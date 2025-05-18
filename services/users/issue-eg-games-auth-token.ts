import * as jwt from 'jsonwebtoken'
import env from '../../utils/env'

const TOKEN_EXPIRES_IN = '30m'

export default (user, additional = {}) => () => (
  jwt.sign({
    id: user.id,
    email: user.email,
    createdAt: new Date(),
    ...additional,
  }, env('EK_GAMES_AUTH_KEY'), { expiresIn: TOKEN_EXPIRES_IN })
)
