import Joi from 'joi'

export const schema = Joi.array().items(Joi.string().uuid().required()).required()
