import { payload, route, id, files, query, customParam } from '../../../utils/route/attach-route'
import { authAdmin } from '../../middleware/authorize'
import attachFlashcards from './actions/attach-flashcards'
import createTextBookContent from './actions/create-text-book-content'
import deleteBookContent from './actions/delete-book-content'
import detachSingleFlashcard from './actions/detach-single-flashcard'
import fetchFromSubchapter from './actions/fetch-book-contents'
import updateBookContentFile from './actions/update-book-content-file'
import updateTextBookContent from './actions/update-text-book-content'
import uploadBookContentFile from './actions/upload-book-content-file'
import attachVideos from './actions/attach-videos'
import attachQuestions from './actions/attach-questions'
import detachQuestions from './actions/detach-questions'
import { checkLockedBookByContentId, checkLockedBookBySubchapterIdCustomPath } from '../../middleware/check-locked-book'
import { bookPermissionByContentId, bookPermissionBySubchapterIdFromPayload } from '../../middleware/book-permission'
import { BookAdminPermissionsEnum } from '../book-admins/book-admin-permissions'

export default app => {
  app.post('/book-contents/text', authAdmin, bookPermissionBySubchapterIdFromPayload(BookAdminPermissionsEnum.edit_content), checkLockedBookBySubchapterIdCustomPath(['body', 'subchapterId']), route(createTextBookContent, [payload]))
  app.post('/book-contents/file/upload', authAdmin, bookPermissionBySubchapterIdFromPayload(BookAdminPermissionsEnum.edit_content), checkLockedBookBySubchapterIdCustomPath(['body', 'subchapterId']), route(uploadBookContentFile, [files, payload]))
  app.post('/book-contents/:id/flashcards', authAdmin, bookPermissionByContentId(BookAdminPermissionsEnum.assign_flashcards), checkLockedBookByContentId, route(attachFlashcards, [id, payload]))
  app.post('/book-contents/:id/videos', authAdmin, bookPermissionByContentId(BookAdminPermissionsEnum.assign_videos), checkLockedBookByContentId, route(attachVideos, [id, payload]))
  app.post('/book-contents/:id/questions', authAdmin, bookPermissionByContentId(BookAdminPermissionsEnum.assign_content_questions), checkLockedBookByContentId, route(attachQuestions, [id, payload]))
  app.post('/book-contents/:id/questions/detach', authAdmin, bookPermissionByContentId(BookAdminPermissionsEnum.assign_content_questions), checkLockedBookByContentId, route(detachQuestions, [id, payload]))
  app.post('/book-contents/:id/flashcards/:flashcard_id/detach', authAdmin, bookPermissionByContentId(BookAdminPermissionsEnum.assign_flashcards), checkLockedBookByContentId, route(detachSingleFlashcard, [id, customParam('flashcard_id')]))

  app.patch('/book-contents/:id/text', authAdmin, bookPermissionByContentId(BookAdminPermissionsEnum.edit_content), checkLockedBookByContentId, route(updateTextBookContent, [id, payload]))
  app.patch('/book-contents/:id/file', authAdmin, bookPermissionByContentId(BookAdminPermissionsEnum.edit_content), checkLockedBookByContentId, route(updateBookContentFile, [id, files, payload]))

  app.get('/book-contents/:id', authAdmin, route(fetchFromSubchapter, [id, query]))

  app.delete('/book-contents/:id', authAdmin, bookPermissionByContentId(BookAdminPermissionsEnum.edit_content), checkLockedBookByContentId, route(deleteBookContent, [id]))
}
