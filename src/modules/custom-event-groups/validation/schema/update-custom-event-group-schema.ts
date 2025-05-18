import Joi from 'joi'

export const schema = Joi.object({
  title: Joi.string().required(),
  course_id: Joi.string().uuid().required(),
  colour_gradient_start: Joi.string().optional(),
  colour_gradient_end: Joi.string().optional(),
  colour_font: Joi.string().optional(),
})
