import Joi from 'joi'
import { PinNoteVariantEnum as Variant } from '../../pin-note-variants'

export const schema = Joi.object({
  content_id: Joi.string().uuid().required(),
  variant: Joi.string().valid(Variant.A, Variant.B, Variant.C).required(),
  note: Joi.string().max(200).required(),
})
