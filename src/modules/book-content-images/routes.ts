import { customParam, files, id, payload, route } from '../../../utils/route/attach-route'
import { authAdmin } from '../../middleware/authorize'
import addBookContentImage from './actions/add-book-content-image'
import fetchAllImagesFromPage from './actions/fetch-all-images-from-page'
import deleteContentImage from './actions/delete-book-content-image'
import updateBookContentImage from './actions/update-book-content-image'
import { BookAdminPermissionsEnum } from '../book-admins/book-admin-permissions'
import { bookPermissionByIdFromPayload, bookPermissionByRelatedItemId } from '../../middleware/book-permission'
import { BookContentImage } from '../../models'

export default app => {
  app.post('/book-content-images', authAdmin, bookPermissionByIdFromPayload(BookAdminPermissionsEnum.edit_content, ['body', 'contentId']), route(addBookContentImage, [files, payload]))

  app.patch('/book-content-images/:id', authAdmin, bookPermissionByRelatedItemId(BookContentImage, BookAdminPermissionsEnum.edit_content), route(updateBookContentImage, [id, files, payload]))

  app.get('/book-content-images/:id/:part', authAdmin, route(fetchAllImagesFromPage, [id, customParam('part')]))

  app.delete('/book-content-images/:id', authAdmin, bookPermissionByRelatedItemId(BookContentImage, BookAdminPermissionsEnum.edit_content, true), route(deleteContentImage, [id]))
}
