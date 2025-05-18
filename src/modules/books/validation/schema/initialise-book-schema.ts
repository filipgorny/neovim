import Joi from 'joi'
import { BookTagColourTypes } from '../../book-tag-colours'

export const schema = Joi.object({
  title: Joi.string().required(),
  firstChapterTitle: Joi.string().required(),
  externalId: Joi.string().allow(''),
  tag: Joi.string().required(),
  tagColour: Joi.string().valid(
    ...BookTagColourTypes
  ).required(),
  image: Joi.allow(null).optional(),
  coverImage: Joi.allow(null).optional(),
  chapterHeadingImage: Joi.allow(null).optional(),
  isTestBundle: Joi.boolean().required(),
  headerAbbreviation: Joi.string().required(),
  codename: Joi.string().optional(),
})
