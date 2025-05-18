import { payload, route, id, customParam, query, payloadValidate } from '../../../utils/route/attach-route'
import { authAdmin } from '../../middleware/authorize'
import { checkLockedBookByChapterIdCustomPath, checkLockedBookBySubchapterId } from '../../middleware/check-locked-book'
import { bookPermissionByChapterIdFromPayload, bookPermissionBySubchapterId } from '../../middleware/book-permission'
import { BookAdminPermissionsEnum } from '../book-admins/book-admin-permissions'
import createSubchapter from './actions/create-subchapter'
import updateSubchapter from './actions/update-subchapter'
import fetchSubchapters from './actions/fetch-book-subchapters'
import fetchSubchaptersFromPart from './actions/fetch-subchapters-from-part'
import deleteSubchapter from './actions/delete-subchapter'
import moveSubchapter from './actions/move-subchapter'
import moveSubchapterToPart from './actions/move-subchapter-to-part'
import splitSubchapter from './actions/split-subchapter'
import mergeSubchapters from './actions/merge-subchapters'
import fetchSubchapterWithBookContents from './actions/fetch-subchapter-with-book-contents'

import { schema as createSubchapterSchema } from './validation/schema/create-subchapter-schema'
import { schema as moveSubchapterSchema } from './validation/schema/move-subchapter-schema'
import { schema as moveSubchapterToPartSchema } from './validation/schema/move-subchapter-to-part-schema'

export default app => {
  app.post('/book-subchapters', authAdmin, checkLockedBookByChapterIdCustomPath(['body', 'chapterId']), bookPermissionByChapterIdFromPayload(BookAdminPermissionsEnum.edit_content), route(createSubchapter, [payloadValidate(createSubchapterSchema)]))

  app.patch('/book-subchapters/:id', authAdmin, checkLockedBookBySubchapterId, bookPermissionBySubchapterId(BookAdminPermissionsEnum.edit_content), route(updateSubchapter, [id, payload]))
  app.patch('/book-subchapters/:id/move', authAdmin, checkLockedBookBySubchapterId, bookPermissionBySubchapterId(BookAdminPermissionsEnum.edit_content), route(moveSubchapter, [id, payloadValidate(moveSubchapterSchema)]))
  app.patch('/book-subchapters/:id/move-to-part', authAdmin, checkLockedBookBySubchapterId, bookPermissionBySubchapterId(BookAdminPermissionsEnum.edit_content), route(moveSubchapterToPart, [id, payloadValidate(moveSubchapterToPartSchema)]))
  app.patch('/book-subchapters/:id/split/:content_id', authAdmin, checkLockedBookBySubchapterId, bookPermissionBySubchapterId(BookAdminPermissionsEnum.edit_content), route(splitSubchapter, [id, customParam('content_id')]))
  app.patch('/book-subchapters/:id/merge', authAdmin, checkLockedBookBySubchapterId, bookPermissionBySubchapterId(BookAdminPermissionsEnum.edit_content), route(mergeSubchapters, [id]))

  app.get('/book-subchapters/:chapter_id', authAdmin, route(fetchSubchapters, [customParam('chapter_id'), query]))
  app.get('/book-subchapters/:id/with-contents', authAdmin, route(fetchSubchapterWithBookContents, [id]))
  app.get('/book-subchapters/:chapter_id/:part', authAdmin, route(fetchSubchaptersFromPart, [customParam('chapter_id'), customParam('part')]))

  app.delete('/book-subchapters/:id', authAdmin, checkLockedBookBySubchapterId, bookPermissionBySubchapterId(BookAdminPermissionsEnum.edit_content), route(deleteSubchapter, [id]))
}
