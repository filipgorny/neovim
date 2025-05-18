import Joi from 'joi'
import { VideoCategories } from '../../video-categories'

export const schema = Joi.object({
  title: Joi.string(),
  description: Joi.string().max(255),
  source: Joi.string(),
  image: Joi.allow(null),
  category: Joi.string().valid(...Object.values(VideoCategories)).optional(),
  course_end_date_id: Joi.string().uuid().optional(),
  course_id: Joi.string().uuid().optional(),
  source_no_bg_music: Joi.string().allow('').optional(),
})

export const fileSchema = Joi.object({
  image: Joi.any(),
})
