import Joi from 'joi'
import { BookTagColourTypes } from '../../book-tag-colours'

export const schema = Joi.object({
  title: Joi.string(),
  external_id: Joi.string().allow(''),
  tag: Joi.string(),
  tag_colour: Joi.string().valid(
    ...BookTagColourTypes
  ),
  image: Joi.allow(null).optional(),
  chapterHeadingImage: Joi.allow(null).optional(),
  coverImage: Joi.allow(null).optional(),
  header_abbreviation: Joi.string().optional(),
  codename: Joi.string().optional(),
})
