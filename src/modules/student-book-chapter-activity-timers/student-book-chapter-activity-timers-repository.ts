import { StudentBookChapterActivityTimer } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete,
  _deleteAllByCustomColumn
} from '../../../utils/generics/repository'
import { _deleteAll } from '@desmart/js-utils'

const MODEL = StudentBookChapterActivityTimer
const MODEL_NAME = 'StudentBookChapterActivityTimer'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)(dto, trx)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const find = async (query: { limit: number, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: {}, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const deleteAll = async (ids: string[]) => (
  _deleteAll(MODEL)(ids)
)

export const deleteAttachmentsByChapterId = async (chapter_id: string) => (
  _deleteAllByCustomColumn(MODEL)('student_book_chapter_id', [chapter_id])
)
