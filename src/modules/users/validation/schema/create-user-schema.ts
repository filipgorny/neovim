import Joi from 'joi'
import { PASSWORD_MIN_LENGTH } from '../../../../constants'

export const schema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required().min(PASSWORD_MIN_LENGTH),
  email_verification_token: Joi.string().required(),
  link: Joi.string().required(),
})

export const createFromInviteSchema = Joi.object({
  password: Joi.string().required().min(PASSWORD_MIN_LENGTH),
})
