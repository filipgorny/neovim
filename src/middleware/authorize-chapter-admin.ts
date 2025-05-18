import * as R from 'ramda'
import { wrap } from 'express-promise-wrap'
import { chapterIdRequiredInPayload, studentAuthRequiredException, throwException, unauthenticatedException } from '../../utils/error/error-factory'
import { pathOrFail } from '../../utils/object/path-or-fail'
import { AdminRoleEnum } from '../modules/admins/admin-roles'
import { findOne as findAdminChapter } from '../modules/chapter-admins/chapter-admins-repository'
import { findOne as findSubChapter } from '../modules/book-subchapters/book-subchapter-repository'
import { findOneOrFail as findContent } from '../modules/book-contents/book-content-repository'
import { findOneOrFail as findAttachment } from '../modules/book-content-attachments/book-content-attachment-repository'
import { findOneOrFail as findResource } from '../modules/book-content-resources/book-content-resource-repository'
import { findOneOrFail as findQuestion } from '../modules/book-content-questions/book-content-questions-repository'
import { findOneOrFail as findImage } from '../modules/book-content-images/book-content-image-repository'

const nestedResources = {
  attachment: findAttachment,
  resource: findResource,
  question: findQuestion,
  image: findImage,
}

const getAdminFromRequest = R.pipe(
  pathOrFail(['user'], studentAuthRequiredException()),
  R.invoker(0, 'toJSON')
)

const getChapterAdmin = async (admin_id: string, chapter_id: string) => (
  findAdminChapter({
    chapter_id,
    admin_id,
  })
)

const validateChapterAdmin = R.when(
  R.isNil,
  () => throwException(unauthenticatedException())
)

const isMasterAdmin = R.propEq('admin_role', AdminRoleEnum.master_admin)

export const authorizeChapterAdminByPayload = wrap(async (req, res, next) => {
  const chapterId = pathOrFail(['body', 'chapterId'], chapterIdRequiredInPayload())(req)
  const admin = getAdminFromRequest(req)

  if (isMasterAdmin(admin)) {
    return next()
  }

  const chapterAdmin = await getChapterAdmin(admin.id, chapterId)

  validateChapterAdmin(chapterAdmin)

  next()
})

export const authorizeChapterAdminBySubchapterId = path => wrap(async (req, res, next) => {
  const subchapterId = R.path(path)(req)
  const admin = getAdminFromRequest(req)

  if (isMasterAdmin(admin)) {
    return next()
  }

  const subChapter = await findSubChapter({
    id: subchapterId,
  })

  const chapterAdmin = await getChapterAdmin(admin.id, subChapter.chapter_id)

  validateChapterAdmin(chapterAdmin)

  next()
})

export const authorizeChapterAdminByContentId = path => wrap(async (req, res, next) => {
  const contentId = R.path(path)(req)
  const admin = getAdminFromRequest(req)

  if (isMasterAdmin(admin)) {
    return next()
  }

  const content = await findContent({
    id: contentId,
  }, ['subchapter'])

  const chapterId = R.path(['subchapter', 'chapter_id'])(content)
  const chapterAdmin = await getChapterAdmin(admin.id, chapterId)

  validateChapterAdmin(chapterAdmin)

  next()
})

export const authorizeChapterAdminByNestedResourceId = resourceType => path => wrap(async (req, res, next) => {
  const id = R.path(path)(req)
  const admin = getAdminFromRequest(req)

  if (isMasterAdmin(admin)) {
    return next()
  }

  const entity = await nestedResources[resourceType]({
    id,
  }, ['content.subchapter'])

  const chapterId = R.path(['content', 'subchapter', 'chapter_id'])(entity)
  const chapterAdmin = await getChapterAdmin(admin.id, chapterId)

  validateChapterAdmin(chapterAdmin)

  next()
})

export const authorizeChapterAdminByAttachmentId = path => (
  authorizeChapterAdminByNestedResourceId('attachment')(path)
)

export const authorizeChapterAdminByResourceId = path => (
  authorizeChapterAdminByNestedResourceId('resource')(path)
)

export const authorizeChapterAdminByQuestionId = path => (
  authorizeChapterAdminByNestedResourceId('question')(path)
)

export const authorizeChapterAdminByImageId = path => (
  authorizeChapterAdminByNestedResourceId('image')(path)
)
