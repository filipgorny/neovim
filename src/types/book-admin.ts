import { BookAdminPermissionsEnum } from '../modules/book-admins/book-admin-permissions'

export type BookAdmin = {
  id: string,
  admin_id: string,
  book_id: string,
  permission: BookAdminPermissionsEnum,
}

export type BookAdminDTO = Omit<BookAdmin, 'id'>
