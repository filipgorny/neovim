import * as R from 'ramda'
import { wrap } from 'express-promise-wrap'
import { tokenFromRequest, parseToken } from '../../utils/request/data-from-request'
import { AdminRoleEnum, AdminRoles } from '../modules/admins/admin-roles'
import validateAccountIsActive from '../modules/admins/validation/validate-account-is-active'
import { Admin } from '../models'
import { findOneOrFail as findBookContent } from '../modules/book-contents/book-content-repository'
import { findOneOrFail as findSubchapter } from '../modules/book-subchapters/book-subchapter-repository'
import { findOneOrFail as findChapter } from '../modules/book-chapters/book-chapter-repository'
import { BookAdminPermissionsEnum } from '../modules/book-admins/book-admin-permissions'
import { findOne as findPermission } from '../modules/book-admins/book-admins-repository'
import { findOne as findBookContentFlashcard } from '../modules/book-content-flashcards/book-content-flashcard-repository'
import { findOne as findBookContentQuestion } from '../modules/book-content-questions/book-content-questions-repository'
import { findOne as findBookContentResource } from '../modules/book-content-resources/book-content-resource-repository'
import { customException } from '@desmart/js-utils'
import { adminFromRequest } from './admin-from-request'
import { wrapMiddleware } from './wrap-middleware'
import { GlobalPerms } from '../modules/admins/admin-global-permissions'
import {
  throwException,
  unauthenticatedException
} from '../../utils/error/error-factory'

const authorizeUser = async (MODEL, id) => {
  const user = await (
    new MODEL({ id }).fetch()
  ).catch(throwUnauthenticatedException)

  validateAccountIsActive(user.toJSON())

  return user
}

const throwUnauthenticatedException = (): never => throwException(unauthenticatedException())

const adminCheck = async (data, subroles: string[] = [...AdminRoles]) => {
  const user = await authorizeUser(Admin, data.id)

  if (!subroles.includes(user.get('admin_role'))) {
    throwUnauthenticatedException()
  }

  return { user }
}

const adminEntityFromRequest = async (req) => {
  const token = tokenFromRequest(req)
  const data = token ? parseToken(token) : null

  if (!data) throwUnauthenticatedException()

  const adminEntity = await adminCheck(data)

  if (!adminEntity) {
    throwUnauthenticatedException()
  }

  return adminEntity
}

export const bookPermissionByContentId = (perm: BookAdminPermissionsEnum) => wrap(async (req, res, next) => {
  const adminEntity = await adminEntityFromRequest(req)

  if (!adminEntity) {
    throwUnauthenticatedException()
  }

  // @ts-ignore
  const admin = adminEntity.user.toJSON()

  if (admin.admin_role === AdminRoleEnum.master_admin) {
    return next()
  }

  const contentId = R.path(['params', 'id'])(req)
  const bookContent = await findBookContent({ id: contentId }, ['subchapter.chapter.book'])
  const bookId = R.path(['subchapter', 'chapter', 'book', 'id'])(bookContent)

  const permission = await findPermission({
    book_id: bookId,
    admin_id: admin.id,
    permission: perm,
  })

  if (!permission) {
    throwException(customException('book-admins.permission-exception', 403, `Book admin missing ${perm} permission`))
  }

  req.user = adminEntity.user

  next()
})

export const bookPermissionBySubchapterId = (perm: BookAdminPermissionsEnum) => wrap(async (req, res, next) => {
  const adminEntity = await adminEntityFromRequest(req)

  if (!adminEntity) {
    throwUnauthenticatedException()
  }

  // @ts-ignore
  const admin = adminEntity.user.toJSON()

  if (admin.admin_role === AdminRoleEnum.master_admin) {
    return next()
  }

  const subchapterId = R.path(['params', 'id'])(req)
  const subchapter = await findSubchapter({ id: subchapterId }, ['chapter.book'])
  const bookId = R.path(['chapter', 'book', 'id'])(subchapter)

  const permission = await findPermission({
    book_id: bookId,
    admin_id: admin.id,
    permission: perm,
  })

  if (!permission) {
    throwException(customException('book-admins.permission-exception', 403, `Book admin missing ${perm} permission`))
  }

  req.user = adminEntity.user

  next()
})

export const bookPermissionBySubchapterIdFromPayload = (perm: BookAdminPermissionsEnum) => wrap(async (req, res, next) => {
  const adminEntity = await adminEntityFromRequest(req)

  if (!adminEntity) {
    throwUnauthenticatedException()
  }

  // @ts-ignore
  const admin = adminEntity.user.toJSON()

  if (admin.admin_role === AdminRoleEnum.master_admin) {
    return next()
  }

  const subchapterId = R.path(['body', 'subchapterId'])(req)
  const subchapter = await findSubchapter({ id: subchapterId }, ['chapter.book'])
  const bookId = R.path(['chapter', 'book', 'id'])(subchapter)

  const permission = await findPermission({
    book_id: bookId,
    admin_id: admin.id,
    permission: perm,
  })

  if (!permission) {
    throwException(customException('book-admins.permission-exception', 403, `Book admin missing ${perm} permission`))
  }

  req.user = adminEntity.user

  next()
})

export const bookPermissionByChapterIdFromPayload = (perm: BookAdminPermissionsEnum) => wrap(async (req, res, next) => {
  const adminEntity = await adminEntityFromRequest(req)

  if (!adminEntity) {
    throwUnauthenticatedException()
  }

  // @ts-ignore
  const admin = adminEntity.user.toJSON()

  if (admin.admin_role === AdminRoleEnum.master_admin) {
    return next()
  }

  const chapterId = R.path(['body', 'chapterId'])(req)
  const chapter = await findChapter({ id: chapterId }, ['book'])
  const bookId = R.path(['book', 'id'])(chapter)

  const permission = await findPermission({
    book_id: bookId,
    admin_id: admin.id,
    permission: perm,
  })

  if (!permission) {
    throwException(customException('book-admins.permission-exception', 403, `Book admin missing ${perm} permission`))
  }

  req.user = adminEntity.user

  next()
})

export const bookPermissionByChapterId = (perm: BookAdminPermissionsEnum) => wrap(async (req, res, next) => {
  const adminEntity = await adminEntityFromRequest(req)

  if (!adminEntity) {
    throwUnauthenticatedException()
  }

  // @ts-ignore
  const admin = adminEntity.user.toJSON()

  if (admin.admin_role === AdminRoleEnum.master_admin) {
    return next()
  }

  const chapterId = R.path(['params', 'id'])(req)
  const chapter = await findChapter({ id: chapterId }, ['book'])
  const bookId = R.path(['book', 'id'])(chapter)

  const permission = await findPermission({
    book_id: bookId,
    admin_id: admin.id,
    permission: perm,
  })

  if (!permission) {
    throwException(customException('book-admins.permission-exception', 403, `Book admin missing ${perm} permission`))
  }

  req.user = adminEntity.user

  next()
})

export const bookPermissionByBookIdFromPayload = (perm: BookAdminPermissionsEnum) => wrap(async (req, res, next) => {
  const adminEntity = await adminEntityFromRequest(req)

  if (!adminEntity) {
    throwUnauthenticatedException()
  }

  // @ts-ignore
  const admin = adminEntity.user.toJSON()

  if (admin.admin_role === AdminRoleEnum.master_admin) {
    return next()
  }

  const bookId = R.path(['body', 'bookId'])(req)

  const permission = await findPermission({
    book_id: bookId,
    admin_id: admin.id,
    permission: perm,
  })

  if (!permission) {
    throwException(customException('book-admins.permission-exception', 403, `Book admin missing ${perm} permission`))
  }

  req.user = adminEntity.user

  next()
})

export const bookPermissionByBookId = (perm: BookAdminPermissionsEnum) => wrap(async (req, res, next) => {
  const adminEntity = await adminEntityFromRequest(req)

  if (!adminEntity) {
    throwUnauthenticatedException()
  }

  // @ts-ignore
  const admin = adminEntity.user.toJSON()

  if (admin.admin_role === AdminRoleEnum.master_admin) {
    return next()
  }

  const bookId = R.path(['params', 'id'])(req)

  const permission = await findPermission({
    book_id: bookId,
    admin_id: admin.id,
    permission: perm,
  })

  if (!permission) {
    throwException(customException('book-admins.permission-exception', 403, `Book admin missing ${perm} permission`))
  }

  req.user = adminEntity.user

  next()
})

export const bookPermissionByIdFromPayload = (perm: BookAdminPermissionsEnum, path = []) => wrap(async (req, res, next) => {
  const adminEntity = await adminEntityFromRequest(req)

  if (!adminEntity) {
    throwUnauthenticatedException()
  }

  // @ts-ignore
  const admin = adminEntity.user.toJSON()

  if (admin.admin_role === AdminRoleEnum.master_admin) {
    return next()
  }

  const contentId = R.path(path)(req)
  const book = await findBookContent({ id: contentId }, ['subchapter.chapter.book'])
  const bookId = R.path(['subchapter', 'chapter', 'book', 'id'])(book)

  const permission = await findPermission({
    book_id: bookId,
    admin_id: admin.id,
    permission: perm,
  })

  if (!permission) {
    throwException(customException('book-admins.permission-exception', 403, `Book admin missing ${perm} permission`))
  }

  req.user = adminEntity.user

  next()
})

export const bookPermissionByRelatedItemId = (RelatedModel: any, perm: BookAdminPermissionsEnum, allowMissingContentItem = false) => wrap(async (req, res, next) => {
  const adminEntity = await adminEntityFromRequest(req)

  if (!adminEntity) {
    throwUnauthenticatedException()
  }

  // @ts-ignore
  const admin = adminEntity.user.toJSON()

  if (admin.admin_role === AdminRoleEnum.master_admin) {
    return next()
  }

  const itemId = R.path(['params', 'id'])(req)
  const item = await new RelatedModel({ id: itemId }).fetch()
  const contentId = item.toJSON().content_id

  let bookContent

  /**
   * In some cases the parent item (book content) may not exist (it was deleted).
   * We allow to delete the related item in this case.
   */
  if (allowMissingContentItem) {
    try {
      bookContent = await findBookContent({ id: contentId }, ['subchapter.chapter.book'])
    } catch (e) {
      return next()
    }
  } else {
    bookContent = await findBookContent({ id: contentId }, ['subchapter.chapter.book'])
  }

  const bookId = R.path(['subchapter', 'chapter', 'book', 'id'])(bookContent)

  const permission = await findPermission({
    book_id: bookId,
    admin_id: admin.id,
    permission: perm,
  })

  if (!permission) {
    throwException(customException('book-admins.permission-exception', 403, `Book admin missing ${perm} permission`))
  }

  req.user = adminEntity.user

  next()
})

const globalPermCheck = async (perm: string, admin) => {
  if (admin.admin_role === AdminRoleEnum.master_admin) {
    return true
  }

  if (!admin[perm]) {
    throwException(customException('admins.permission-exception', 403, `Admin missing ${perm} permission`))
  }

  return true
}

/**
 * Admin must have global permission or book permission (to any book) to handle given request.
 */
const _looseBookOrGlobalPermission = (perm: BookAdminPermissionsEnum, globalPerm: string) => async (req, res) => {
  let isGlobalAdmin = false

  const admin = await adminFromRequest(req)

  try {
    isGlobalAdmin = await globalPermCheck(globalPerm, admin)
  } catch (e) {}

  // Has global permission
  if (isGlobalAdmin) {
    return
  }

  const permission = await findPermission({
    admin_id: admin.id,
    permission: perm,
  })

  // Does not have book permission either - no access.
  if (!permission) {
    throwException(customException('book-admins.permission-exception', 403, `Book admin missing ${perm} permission`))
  }
}

/**
 * Admin must have global permission or book permission (to given book) to handle given request.
 * In other words - admin can modify unattached or "his own" items (e.g. flashcards, content questions).
 */
const onlyAssignedItems = (globalPerm, idFieldName, searchFn, bookPerm) => async (req, res) => {
  let isGlobalAdmin = false

  const admin = await adminFromRequest(req)

  try {
    isGlobalAdmin = await globalPermCheck(globalPerm, admin)
  } catch (e) {}

  // Has global permission
  if (isGlobalAdmin) {
    return true
  }

  const itemId = R.path(['params', 'id'])(req)

  const attachedItem = await searchFn({ [idFieldName]: itemId }, ['content.subchapter.chapter.book'])

  // Item not attached to any book content - ok.
  if (!attachedItem) {
    return true
  }

  const bookId = R.path(['content', 'subchapter', 'chapter', 'book', 'id'])(attachedItem)

  const permission = await findPermission({
    book_id: bookId,
    admin_id: admin.id,
    permission: bookPerm,
  })

  // Does not have permission to modify given book - no access.
  if (!permission) {
    throwException(customException('book-admins.permission-exception', 403, `Book admin missing ${BookAdminPermissionsEnum.assign_flashcards} permission`))
  }

  return true
}

const _onlyAssignedFlashcards = onlyAssignedItems(GlobalPerms.F, 'flashcard_id', findBookContentFlashcard, BookAdminPermissionsEnum.assign_flashcards)
const _onlyAssignedQuestions = onlyAssignedItems(GlobalPerms.C, 'question_id', findBookContentQuestion, BookAdminPermissionsEnum.assign_content_questions)
const _onlyAssignedVideos = onlyAssignedItems(GlobalPerms.V, 'original_resource_id', findBookContentResource, BookAdminPermissionsEnum.assign_videos)

export const looseBookOrGlobalPermission = (perm: BookAdminPermissionsEnum, globalPerm: string) => wrapMiddleware(_looseBookOrGlobalPermission(perm, globalPerm))
export const onlyAssignedFlashcards = wrapMiddleware(_onlyAssignedFlashcards)
export const onlyAssignedQuestions = wrapMiddleware(_onlyAssignedQuestions)
export const onlyAssignedVideos = wrapMiddleware(_onlyAssignedVideos)
