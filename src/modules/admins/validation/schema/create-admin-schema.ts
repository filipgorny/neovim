import Joi from 'joi'
import { PASSWORD_MIN_LENGTH } from '../../../../constants'

export const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(PASSWORD_MIN_LENGTH),
  name: Joi.string()
})
