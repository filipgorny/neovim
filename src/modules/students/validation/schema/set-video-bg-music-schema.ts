import Joi from 'joi'

export const schema = Joi.object({
  video_bg_music_enabled: Joi.boolean().required(),
})
