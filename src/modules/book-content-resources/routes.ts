import { user, route, payload, id } from '@desmart/js-utils'
import { authAdmin } from '../../middleware/authorize'
import createTextBookContentResource from './actions/create-text-book-content-resource'
import createVideoBookContentResource from './actions/create-video-book-contnent-resource'
import fetchContentResources from './actions/fetch-content-resources'
import deleteContentResource from './actions/delete-book-content-resource'
import updateTextBookContentResource from './actions/update-text-book-content-resource'
import updateVideoBookContentResource from './actions/update-video-book-content-resource'
import { BookAdminPermissionsEnum } from '../book-admins/book-admin-permissions'
import { bookPermissionByIdFromPayload, bookPermissionByRelatedItemId, looseBookOrGlobalPermission, onlyAssignedVideos } from '../../middleware/book-permission'
import { BookContentResource } from '../../models'
import { GlobalPerms } from '../admins/admin-global-permissions'
import { permCheck } from '../../middleware/global-permission'

export default app => {
  app.post('/book-content-resources/text', authAdmin, bookPermissionByIdFromPayload(BookAdminPermissionsEnum.edit_content, ['body', 'contentId']), route(createTextBookContentResource, [payload]))
  app.post('/book-content-resources/video', permCheck(GlobalPerms.V), route(createVideoBookContentResource, [payload]))

  app.get('/book-content-resources/:id', authAdmin, route(fetchContentResources, [id]))

  app.delete('/book-content-resources/:id', looseBookOrGlobalPermission(BookAdminPermissionsEnum.edit_content, GlobalPerms.V), onlyAssignedVideos, route(deleteContentResource, [user, id]))
  app.delete('/book-content-resources/:id/video', looseBookOrGlobalPermission(BookAdminPermissionsEnum.assign_videos, GlobalPerms.V), onlyAssignedVideos, route(deleteContentResource, [user, id]))

  app.patch('/book-content-resources/:id/text', authAdmin, bookPermissionByRelatedItemId(BookContentResource, BookAdminPermissionsEnum.edit_content), route(updateTextBookContentResource, [id, payload]))
  app.patch('/book-content-resources/:id/video', permCheck(GlobalPerms.V), route(updateVideoBookContentResource, [id, payload]))
}
