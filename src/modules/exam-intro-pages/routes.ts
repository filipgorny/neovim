import { customParam, route, payload, id, payloadValidate } from '../../../utils/route/attach-route'
import { allow, authAdmin, Role } from '../../middleware/authorize'
import fetchIntroPages from './actions/fetch-intro-pages'
import updateIntroPages from './actions/update-intro-pages'

import { schema as updateIntroPagesSchema } from './validation/update-intro-page-schema'

export default app => {
  app.patch('/exam-intro-pages/:exam_type_id', allow(Role.igor), route(updateIntroPages, [customParam('exam_type_id'), payloadValidate(updateIntroPagesSchema)]))

  app.get('/exam-intro-pages/:exam_type_id', authAdmin, route(fetchIntroPages, [customParam('exam_type_id')]))
}
