import R from 'ramda'
import { payload, route, query, id, customParam, user, payloadValidate } from '../../../utils/route/attach-route'
import { allow, authAdmin, authMasterAdmin, Role } from '../../middleware/authorize'
import initialiseBook from './actions/initialise-book'
import fetchAllBooksByAdmin from './actions/fetch-all-books-by-admin'
import fetchAllBooks from './actions/fetch-all-books'
import fetchBook from './actions/fetch-book'
import updateBook from './actions/update-book'
import fetchBookWithPageContents from './actions/fetch-book-with-page-contents'
import attachExams from './actions/attach-exams'
import previewBook from './actions/preview-book'
import fetchBookChapters from './actions/fetch-book-chapters'
import deleteBook from './actions/delete-book'
import reorderChapters from './actions/reorder-chapters'
import copyBook from './actions/copy-book'
import archiveBook from './actions/archive-book'
import fetchArchivedBooks from './actions/fetch-archived-books'
import lockBook from './actions/lock-book'
import toggleFlashcardsAccessible from './actions/toggle-flashcards-accessible'
import renumberFlashcards from './actions/renumber-flashcards'
import deleteBookCompletely from './actions/delete-book-completely'
import fetchSoftDeletedBooks from './actions/fetch-soft-deleted-books'
import fetchBookWithPageContentsPartially from './actions/fetch-book-with-page-contents-partially'
import { checkLockedBook } from '../../middleware/check-locked-book'
import { BookAdminPermissionsEnum } from '../book-admins/book-admin-permissions'
import { bookPermissionByBookId } from '../../middleware/book-permission'
import restoreBook from './actions/restore-book'
import autoReorderContentQuestions from './actions/auto-reorder-content-questions'
import fetchWholeBook from './actions/fetch-whole-book'
import toggleAiTutor from './actions/toggle-ai-tutor'

import { schema as reorderChaptersSchema } from './validation/schema/reorder-chapters-schema'
import { schema as initialiseBookSchema } from './validation/schema/initialise-book-schema'
import { schema as updateBookSchema } from './validation/schema/update-book-schema'
import { schema as renumberFlashcardsSchema } from './validation/schema/renumber-flashcards-schema'
import { schema as attachExamsSchema } from './validation/schema/attach-exams-schema'
import { schema as fetchBookWithPageContentsPartiallySchema } from './validation/schema/fetch-book-with-page-content-partially-schema'

const imageFile = R.path(['files', 'image'])
const chapterHeadingImageFile = R.path(['files', 'chapterHeadingImage'])
const coverImageFile = R.path(['files', 'coverImage'])

export default app => {
  app.post('/books', authMasterAdmin, route(initialiseBook, [payloadValidate(initialiseBookSchema), imageFile, chapterHeadingImageFile, coverImageFile]))
  app.post('/books/:id/preview', authAdmin, route(previewBook, [user, id]))
  app.post('/books/:id/attach/:exam_id', authAdmin, checkLockedBook, route(attachExams, [id, customParam('exam_id'), payloadValidate(attachExamsSchema)]))
  app.post('/books/:id/copy', authMasterAdmin, route(copyBook, [id, user]))
  app.post('/books/:id/renumber-flashcards', authAdmin, route(renumberFlashcards, [id, payloadValidate(renumberFlashcardsSchema)]))
  app.post('/books/:id/restore', authMasterAdmin, route(restoreBook, [id]))
  app.post('/books/:id/details/:chapter_order/:part/partial', authAdmin, route(
    fetchBookWithPageContentsPartially, [
      id,
      customParam('chapter_order'),
      customParam('part'),
      user,
      payloadValidate(fetchBookWithPageContentsPartiallySchema),
    ]))

  app.patch('/books/:id', authAdmin, bookPermissionByBookId(BookAdminPermissionsEnum.edit_content), checkLockedBook, route(updateBook, [id, payloadValidate(updateBookSchema), imageFile, chapterHeadingImageFile, coverImageFile]))
  app.patch('/books/:id/reorder', authAdmin, bookPermissionByBookId(BookAdminPermissionsEnum.edit_content), checkLockedBook, route(reorderChapters, [id, payloadValidate(reorderChaptersSchema)]))
  app.patch('/books/:id/archive/:is_archived', authMasterAdmin, checkLockedBook, route(archiveBook, [id, customParam('is_archived')]))
  app.patch('/books/:id/lock/:is_locked', authMasterAdmin, route(lockBook, [id, customParam('is_locked')]))
  app.patch('/books/:id/flashcards/accessible/:accessible', authMasterAdmin, route(toggleFlashcardsAccessible, [id, customParam('accessible')]))
  app.patch('/books/:id/content-questions/auto-reorder', authMasterAdmin, route(autoReorderContentQuestions, [id]))
  app.patch('/books/:id/toggle-ai-tutor', authMasterAdmin, route(toggleAiTutor, [id]))

  app.get('/books', allow(Role.igor, Role.author, Role.flashcard, Role.glossary, Role.question, Role.retail, Role.test), route(fetchAllBooksByAdmin, [user, query]))
  app.get('/books/all', authAdmin, route(fetchAllBooks, [query]))
  app.get('/books/archived', authMasterAdmin, route(fetchArchivedBooks, [user, query]))
  app.get('/books/soft-deleted', authMasterAdmin, route(fetchSoftDeletedBooks, [user, query]))
  app.get('/books/:id', authAdmin, route(fetchBook, [id]))
  app.get('/books/:id/whole', authAdmin, route(fetchWholeBook, [id]))
  app.get('/books/:id/details/:chapter_order/:part', authAdmin, route(
    fetchBookWithPageContents, [
      id,
      customParam('chapter_order'),
      customParam('part'),
      user,
    ]))
  app.get('/books/:id/details/:chapter_order/:part/partial/:partial', authAdmin, route(
    fetchBookWithPageContents, [
      id,
      customParam('chapter_order'),
      customParam('part'),
      user,
      customParam('partial'),
    ]))
  app.get('/books/:id/chapters', authAdmin, route(fetchBookChapters, [id]))

  app.delete('/books/:id', authMasterAdmin, checkLockedBook, route(deleteBook, [id]))
  app.delete('/books/:id/complete-removal', authMasterAdmin, checkLockedBook, route(deleteBookCompletely, [id]))
}
