import Joi from 'joi'

export const schema = Joi.object({
  video_timestamp: Joi.number().positive().required(),
})
