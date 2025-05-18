import Joi from 'joi'

export const schema = Joi.object({
  exam_seconds_left: Joi.array().required().items(
    Joi.object({
      section_id: Joi.string().required(),
      seconds_left: Joi.number().positive().required(),
    })
  ),
  current_page: Joi.string().required(),
  section_id: Joi.string().required(),
})
