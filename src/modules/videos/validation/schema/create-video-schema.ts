import Joi from 'joi'
import { VideoCategories } from '../../video-categories'

export const schema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().max(255).required(),
  source: Joi.string().required(),
  category: Joi.string().valid(...Object.values(VideoCategories)).required(),
  course_end_date_id: Joi.string().uuid().optional(),
  source_no_bg_music: Joi.string().optional(),
  course_id: Joi.string().uuid().optional(),
})

export const fileSchema = Joi.object({
  image: Joi.any(),
})
