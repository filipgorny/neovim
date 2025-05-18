import Joi from 'joi'
import moment from 'moment-timezone'

export const schema = Joi.object({
  timezone: Joi.string().valid(...moment.tz.names()).required(),
})
