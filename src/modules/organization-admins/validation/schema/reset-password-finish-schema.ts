import Joi from 'joi'
import { PASSWORD_MIN_LENGTH } from '../../../../constants'

export const schema = Joi.object({
  id: Joi.string().uuid().required(),
  token: Joi.string().required(),
  password: Joi.string().min(PASSWORD_MIN_LENGTH).required(),
})
