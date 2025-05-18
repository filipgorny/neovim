import Joi from 'joi'

export const schema = Joi.object({
  title: Joi.string().required(),
  type_label: Joi.string().optional().allow(''),
  section_titles: Joi.array().items(
    Joi.object({
      order: Joi.number().integer().min(1).max(4).required(),
      value: Joi.string().required(),
    }).required()
  ).optional(),
})
