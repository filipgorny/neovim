import Joi from 'joi'
import { PinNoteVariantEnum as Variant } from '../../../student-book-content-pins/pin-note-variants'

export const schema = Joi.object({
  student_book_id: Joi.string().uuid().required(),
  variant: Joi.string().valid(Variant.A, Variant.B, Variant.C).required(),
  title: Joi.string().allow(''),
})
