import { authStudent } from '../../middleware/authorize'
import { id, payloadValidate, route, studentId } from '../../../utils/route/attach-route'
import updateBookContentAttachment from './actions/update-book-content-attachment'

import { schema as updateBookContentAttachmentSchema } from './validation/update-book-content-attachment-schema'

export default (app) => {
  app.patch('/student-book-content-attachments/:id', authStudent, route(updateBookContentAttachment, [studentId, id, payloadValidate(updateBookContentAttachmentSchema)]))
}
