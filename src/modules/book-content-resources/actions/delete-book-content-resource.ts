import * as R from 'ramda'
import { findOneOrFail as findResource } from '../book-content-resource-repository'
import { findOneOrFail as findBookContent } from '../../book-contents/book-content-repository'
import { removeResourceInTrx } from '../book-content-resource-service'
import { findOneOrFail as findAdmin } from '../../admins/admin-repository'
import { BookContentResourceTypeEnum } from '../book-contennt-resource-types'
import { AdminRoleEnum } from '../../admins/admin-roles'
import { BookAdminPermissionsEnum } from '../../book-admins/book-admin-permissions'
import { customException, throwException } from '@desmart/js-utils'
import { findOne as findPermission } from '../../book-admins/book-admins-repository'

export const validateBookPermissionByContentId = async (perm: BookAdminPermissionsEnum, user, contentId: string) => {
  if (user.admin_role === AdminRoleEnum.master_admin) {
    return
  }

  const bookContent = await findBookContent({ id: contentId }, ['subchapter.chapter.book'])
  const bookId = R.path(['subchapter', 'chapter', 'book', 'id'])(bookContent)

  const permission = await findPermission({
    book_id: bookId,
    admin_id: user.id,
    permission: perm,
  })

  if (!permission) {
    throwException(customException('book-admins.permission-exception', 403, `Book admin missing ${perm} permission`))
  }
}

const validateUserCanDetachResource = async (resource, user) => {
  const perm = (resource.type === BookContentResourceTypeEnum.video)
    ? BookAdminPermissionsEnum.assign_videos
    : BookAdminPermissionsEnum.edit_content

  await validateBookPermissionByContentId(perm, user, resource.content_id)
}

export default async (user, id: string) => {
  const resource = await findResource({ id })
  const admin = await findAdmin({ id: user.id }, ['bookAdminPermissions'])

  await validateUserCanDetachResource(resource, admin)

  return removeResourceInTrx(resource)
}
