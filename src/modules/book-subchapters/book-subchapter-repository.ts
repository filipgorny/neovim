import BookSubchapterDTO from './dto/book-subchapter-dto'
import models, { BookSubchapter } from '../../models'
import { fetch } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _patchAll,
  _countRecords,
  _delete,
  DELETED_AT,
  fixOrderAfterDeleting,
  _findOneOrFailWithoutDeleted,
  _findOneWithoutDeleted,
  fixOrderAfterAdding,
  _findOneOrFail
} from '../../../utils/generics/repository'

const MODEL = BookSubchapter
const MODEL_NAME = 'BookSubchapter'

export const create = async (dto: BookSubchapterDTO) => (
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

export const findOneOrFailWithDeleted = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const countRecords = async (where: object) => (
  _countRecords(MODEL)({
    ...where,
    [DELETED_AT]: null,
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

export const remove = async (id: string, was_manually_deleted: boolean = true) => (
  _patch(MODEL)(id, {
    [DELETED_AT]: new Date(),
    was_manually_deleted,
  })
)

export const restore = async (id: string) => (
  _patch(MODEL)(id, {
    [DELETED_AT]: null,
    was_manually_deleted: false,
  })
)

export const findAllSubchaptersWithinPart = async (part, chapter_id, withRelated) => (
  fetch(MODEL)({
    part,
    chapter_id,
    [DELETED_AT]: null,
  }, withRelated, undefined, true)
)

export const countSubchaptersWithinPart = async (part, chapter_id) => (
  countRecords({
    part,
    chapter_id,
    [DELETED_AT]: null,
  })
)

export const fixSubchapterOrderAfterAdding = async (chapter_id: string, order: number, trx?): Promise<void> => (
  fixOrderAfterAdding(models.bookshelf.knex, 'book_subchapters', 'chapter_id', trx)(chapter_id, order)
)

export const fixBookSubchapterOrderAfterDeleting = async (chapter_id: string, order: number, trx?): Promise<void> => (
  fixOrderAfterDeleting(models.bookshelf.knex, 'book_subchapters', 'chapter_id', trx)(chapter_id, order)
)

export const fixPartsAfterDeleting = async (chapter_id: string, part: number): Promise<void> => (
  models.bookshelf.knex.raw('UPDATE book_subchapters set "part" = "part" - 1 where chapter_id = ? and "part" >= ? and deleted_at is null', [chapter_id, part])
)
