import { files, payload, route, id } from '../../../utils/route/attach-route'
import { authAdmin } from '../../middleware/authorize'
import createAttachment from './actions/create-attachment'
import uploadAttachment from './actions/upload-attachment'
import updateTextAttachment from './actions/update-text-attachment'
import updateFileAttachment from './actions/update-file-attachment'
import getContentAttachments from './actions/get-contennt-attachments'
import deleteContentAttachment from './actions/delete-content-attachment'
import moveBookAttachment from './actions/move-book-attachment'
import { bookPermissionByIdFromPayload, bookPermissionByRelatedItemId } from '../../middleware/book-permission'
import { BookAdminPermissionsEnum } from '../book-admins/book-admin-permissions'
import { bookContentAttachment } from '../../models'

export default app => {
  app.post('/book-content-attachments/text', authAdmin, bookPermissionByIdFromPayload(BookAdminPermissionsEnum.edit_content, ['body', 'contentId']), route(createAttachment, [payload]))
  app.post('/book-content-attachments/file', authAdmin, bookPermissionByIdFromPayload(BookAdminPermissionsEnum.edit_content, ['body', 'contentId']), route(uploadAttachment, [files, payload]))

  app.patch('/book-content-attachments/:id/text', authAdmin, bookPermissionByRelatedItemId(bookContentAttachment, BookAdminPermissionsEnum.edit_content), route(updateTextAttachment, [id, payload]))
  app.patch('/book-content-attachments/:id/file', authAdmin, bookPermissionByRelatedItemId(bookContentAttachment, BookAdminPermissionsEnum.edit_content), route(updateFileAttachment, [id, files, payload]))
  app.patch('/book-content-attachments/:id/move', authAdmin, bookPermissionByRelatedItemId(bookContentAttachment, BookAdminPermissionsEnum.edit_content), route(moveBookAttachment, [id, payload]))

  app.get('/book-content-attachments/:id', authAdmin, route(getContentAttachments, [id]))

  app.delete('/book-content-attachments/:id', authAdmin, bookPermissionByRelatedItemId(bookContentAttachment, BookAdminPermissionsEnum.edit_content), route(deleteContentAttachment, [id]))
}
