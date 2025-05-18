import BookContentDTO from './dto/book-content-dto'
import models, { BookContent } from '../../models'
import { fetch } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _patchAll,
  _findOneWithoutDeleted,
  _findOneOrFailWithoutDeleted,
  _countRecords,
  DELETED_AT,
  fixOrderAfterAdding,
  fixOrderAfterDeleting,
  _patchWhere,
  _findOneInstanceOrFailWithoutDeleted,
  _delete,
  _findOneOrFail
} from '../../../utils/generics/repository'

const MODEL = BookContent
const MODEL_NAME = 'BookContent'

export const create = async (dto: BookContentDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const update = async (id: string, dto: object, trx?) => (
  _patch(MODEL)(id, dto, trx)
)

export const findOne = async (where: object) => (
  _findOneWithoutDeleted(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFailWithoutDeleted(MODEL, MODEL_NAME)(where, withRelated)
)

export const findOneInstanceOrFail = async (where: object, withRelated = []) => (
  _findOneInstanceOrFailWithoutDeleted(MODEL, MODEL_NAME)(where, withRelated)
)

export const findOneOrFailWithDeleted = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const countRecords = async (where: object) => (
  _countRecords(MODEL)({
    [DELETED_AT]: null,
    ...where,
  })
)

export const deleteRecordCompletely = async (id: string) => (
  _delete(MODEL)({ id })
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)({
    ...where,
    [DELETED_AT]: null,
  }, withRelated, query)
)

export const findDeleted = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, withRelated = []) => (
  fetch(MODEL)(function () {
    this.whereNotNull(DELETED_AT).where({ was_manually_deleted: false })
  }, withRelated, query)
)

export const remove = async (id: string, was_manually_deleted: boolean = true) => (
  _patch(MODEL)(id, {
    [DELETED_AT]: new Date(),
    was_manually_deleted,
  })
)

export const deleteAllBookContentsFromSubchapter = (was_manually_deleted: boolean = false) => async (subchapter_id: string) => (
  _patchWhere(MODEL)({ subchapter_id }, {
    [DELETED_AT]: new Date(),
    was_manually_deleted,
  })
)

export const restoreAllBookContentsFromSubchapter = async (subchapter_id: string) => ( // after deleting book
  _patchWhere(MODEL)(function () {
    this.where({ subchapter_id, was_manually_deleted: false }).whereNotNull(DELETED_AT)
  }, {
    [DELETED_AT]: null,
  })
)

export const restore = async (id: string) => (
  _patch(MODEL)(id, {
    [DELETED_AT]: null,
    was_manually_deleted: false,
  })
)

export const deleteSoftDeletedBySubchapterIdCompletely = async (subchapter_id: string) => (
  _delete(MODEL)(function () {
    this.where({ subchapter_id }).whereNotNull(DELETED_AT)
  })
)

export const fixBookContentOrderAfterAdding = async (subchapter_id: string, order: number, trx?): Promise<void> => (
  fixOrderAfterAdding(models.bookshelf.knex, 'book_contents', 'subchapter_id', trx)(subchapter_id, order)
)

export const fixBookContentOrderAfterDeleting = async (subchapter_id: string, order: number, trx?): Promise<void> => (
  fixOrderAfterDeleting(models.bookshelf.knex, 'book_contents', 'subchapter_id', trx)(subchapter_id, order)
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)
