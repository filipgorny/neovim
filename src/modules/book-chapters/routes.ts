import { route, id, payload, query, customParam, payloadValidate } from '../../../utils/route/attach-route'
import { authAdmin } from '../../middleware/authorize'
import { checkLockedBookByChapterId, checkLockedBookCustomIdPath } from '../../middleware/check-locked-book'
import { BookAdminPermissionsEnum } from '../book-admins/book-admin-permissions'
import { bookPermissionByBookIdFromPayload, bookPermissionByChapterId } from '../../middleware/book-permission'
import fetchBookChapters from './actions/fetch-book-chapters'
import createBookChapter from './actions/create-book-chapter'
import attachExams from './actions/attach-exams'
import updateBookChapter from './actions/update-book-chapter'
import deleteChapter from './actions/delete-chapter'
import deletePart from './actions/delete-part'
import splitChapter from './actions/split-chapter'
import reorderParts from './actions/reorder-parts'
import mergeChapters from './actions/merge-chapters'

import { schema as createBookChapterSchema } from './validation/schema/create-book-chapter-schema'
import { schema as updateBookChapterSchema } from './validation/schema/update-chapter-schema'

export default app => {
  app.get('/book-chapters/:id', authAdmin, route(fetchBookChapters, [id, query]))

  app.patch('/book-chapters/:id', authAdmin, bookPermissionByChapterId(BookAdminPermissionsEnum.edit_content), checkLockedBookByChapterId, route(updateBookChapter, [id, payloadValidate(updateBookChapterSchema)]))
  app.patch('/book-chapters/:id/reorder', authAdmin, bookPermissionByChapterId(BookAdminPermissionsEnum.edit_content), checkLockedBookByChapterId, route(reorderParts, [id, payload]))
  app.patch('/book-chapters/:id/split/:subchapter_id', authAdmin, bookPermissionByChapterId(BookAdminPermissionsEnum.edit_content), checkLockedBookByChapterId, route(splitChapter, [id, customParam('subchapter_id')]))
  app.patch('/book-chapters/:id/merge', authAdmin, bookPermissionByChapterId(BookAdminPermissionsEnum.edit_content), checkLockedBookByChapterId, route(mergeChapters, [id]))

  app.post('/book-chapters', authAdmin, bookPermissionByBookIdFromPayload(BookAdminPermissionsEnum.edit_content), checkLockedBookCustomIdPath(['body', 'bookId']), route(createBookChapter, [payloadValidate(createBookChapterSchema)]))
  app.post('/book-chapters/:id/attach/:exam_id', authAdmin, checkLockedBookByChapterId, route(attachExams, [id, customParam('exam_id')]))

  app.delete('/book-chapters/:id', authAdmin, bookPermissionByChapterId(BookAdminPermissionsEnum.edit_content), checkLockedBookByChapterId, route(deleteChapter, [id]))
  app.delete('/book-chapters/:id/part/:part', authAdmin, bookPermissionByChapterId(BookAdminPermissionsEnum.edit_content), checkLockedBookByChapterId, route(deletePart, [id, customParam('part')]))
}
