import { ChapterAdmin as ChapterAdminModel } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { ChapterAdmin } from '../../types/chapter-admin'

const MODEL = ChapterAdminModel
const MODEL_NAME = 'ChapterAdmin'

export const create = async (dto: ChapterAdmin) => {
  try {
    const entry = await _create(MODEL)(dto)

    return entry
  } catch (error) {}
}

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

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const deleteRecord = async (data: ChapterAdmin) => (
  _delete(MODEL)({
    admin_id: data.admin_id,
    chapter_id: data.chapter_id,
    book_id: data.book_id,
  })
)

export const deleteWhere = async (where) => (
  _delete(MODEL)(where)
)
