import * as R from 'ramda'
import BookChapterDTO from './dto/book-chapter-dto'
import models, { BookChapter } from '../../models'
import { fetch } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _patchAll,
  _findOne,
  _findOneOrFail,
  DELETED_AT,
  _findOneOrFailWithoutDeleted,
  _findOneWithoutDeleted,
  fixOrderAfterDeleting,
  fixOrderAfterAdding,
  _delete
} from '../../../utils/generics/repository'

const { knex } = models.bookshelf

const MODEL = BookChapter
const MODEL_NAME = 'BookChapter'

export const create = async (dto: BookChapterDTO) => (
  _create(MODEL)({
    ...dto,
  })
)

export const update = async (id: string, dto: {}) => (
  _patch(MODEL)(id, dto)
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

export const getSoftDeletedSubchapterIds = async (id: string) => (
  R.pipeWith(R.andThen)([
    async () => knex.select('id').from('book_subchapters').where({ chapter_id: id }).whereNotNull(DELETED_AT),
    R.pluck('id'),
  ])
)

export const deleteRecordCompletely = async (id: string) => (
  _delete(MODEL)({ id })
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

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)({
    ...where,
    [DELETED_AT]: null,
  }, withRelated, query)
)

export const findByIds = async (ids: string[]) => (
  MODEL.whereIn('id', ids)
    .fetchAll({ withRelated: ['book'] })
)

export const fixChapterOrderAfterAdding = async (book_id: string, order: number): Promise<void> => (
  fixOrderAfterAdding(models.bookshelf.knex, 'book_chapters', 'book_id')(book_id, order)
)

export const fixChapterOrderAfterDeleting = async (book_id: string, order: number): Promise<void> => (
  fixOrderAfterDeleting(models.bookshelf.knex, 'book_chapters', 'book_id')(book_id, order)
)
