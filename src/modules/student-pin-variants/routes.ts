import { payloadValidate, user, customParam } from '@desmart/js-utils/dist/route'
import { route } from '../../../utils/route/attach-route'
import upsertPinVariant from './actions/upsert-pin-variant'

import { schema as upsertPinVariantSchema } from './validation/schema/upsert-pin-variant-schema'
import { authStudent } from '../../middleware/authorize'
import feftchPinVariants from './actions/feftch-pin-variants'

export default app => {
  app.post('/student-pin-variants', authStudent, route(upsertPinVariant, [user, payloadValidate(upsertPinVariantSchema)]))
  app.get('/student-pin-variants/:student_book_id', authStudent, route(feftchPinVariants, [user, customParam('student_book_id')]))
}
