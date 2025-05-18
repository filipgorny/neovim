import Joi from 'joi'

const orderValueSchema = Joi.object({
  order: Joi.number().required(),
  value: Joi.number().required(),
})

const introPageSectionSchema = Joi.object({
  order: Joi.number().required(),
  raw: Joi.string().optional(),
  delta_object: Joi.object().required(),
}).required()

export const schema = Joi.object({
  title: Joi.string().required(),
  type_label: Joi.string().optional().allow(''),
  type: Joi.string().optional(),
  subtype: Joi.string().optional(),
  sectionCount: Joi.number().required(),
  questionAmount: Joi.array().items(
    orderValueSchema
  ),
  examLength: Joi.array().items(
    orderValueSchema
  ),
  breakDefinition: Joi.array().items(
    orderValueSchema
  ),
  introPages: Joi.array().items(
    introPageSectionSchema
  ),
  sectionTitles: Joi.array().items(
    Joi.object({
      order: Joi.number().required(),
      value: Joi.string().required(),
    })
  ),
  scaledScoreRanges: Joi.array().items(
    Joi.object({
      order: Joi.number().required(),
      value: Joi.array().required().items(
        Joi.number()
      ),
    })
  ),
})

export const fileSchema = Joi.object({
  examScaledScoreTemplateXml: Joi.required(),
})
