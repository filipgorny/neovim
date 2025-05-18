import Joi from 'joi'

export const schema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid({ version: 'uuidv4' })).required(),
})

export const detachSschema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid({ version: 'uuidv4' })).required(),
})
