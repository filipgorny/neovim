import Joi from 'joi'

export const schema = Joi.object({
  title: Joi.string().required(),
  image_tab_title: Joi.string().allow(null, ''),
})
