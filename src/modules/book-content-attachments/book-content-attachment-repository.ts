import { BookContentAttachmentDTO } from './dto/book-content-attachment-dto'
import models, { bookContentAttachment } from '../../models'
import {
  _create,
  _patch,
  _findOneOrFail,
  fixOrderAfterAdding,
  _delete,
  fixOrderAfterDeleting
} from '../../../utils/generics/repository'
import { fetch } from '../../../utils/model/fetch'

const MODEL = bookContentAttachment
const MODEL_NAME = 'BookContentAttachment'

export const create = async (dto: BookContentAttachmentDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const patch = async (id: string, data: {}, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const findOneOrFail = async (where: object, withRelated: string[] = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (where = {}, withRelated = []) => (
  fetch(MODEL)({
    ...where,
  }, withRelated, undefined, true)
)

export const remove = async (id: string) => (
  _delete(MODEL)({ id })
)

export const removeWhere = async (where) => (
  _delete(MODEL)(where)
)

export const fixAttachmentOrderAfterAdding = async (content_id: string, order: number, trx?): Promise<void> => (
  fixOrderAfterAdding(models.bookshelf.knex, 'book_content_attachments', 'content_id', trx)(content_id, order)
)

export const fixAttachmentOrderAfterDeleting = async (content_id: string, order: number, trx?): Promise<void> => (
  fixOrderAfterDeleting(models.bookshelf.knex, 'book_content_attachments', 'content_id', trx)(content_id, order)
)
