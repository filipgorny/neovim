import * as R from 'ramda'
import { authStudent } from '../../middleware/authorize'
import { id, payloadValidate, route, studentId } from '../../../utils/route/attach-route'
import updateBookContent from './actions/update-book-content'

import { schema as updateBookContentSchema } from './validation/update-book-content-schema'

export default (app) => {
  app.patch('/student-book-contents/:id', authStudent, route(updateBookContent, [studentId, id, payloadValidate(updateBookContentSchema)], [R.over(R.lensProp('delta_object'), JSON.parse)]))
}
