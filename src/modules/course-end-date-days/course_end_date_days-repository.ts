import { CourseEndDateDay } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { collectionToJson } from '../../../utils/model/collection-to-json'

const MODEL = CourseEndDateDay
const MODEL_NAME = 'CourseEndDateDay'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)(dto, trx)
)

export const findOne = async (where: {}, withRelated = []) => (
  _findOne(MODEL)(where, withRelated)
)

export const findOneOrFail = async (where: object) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const findDaysByCourseEndDateId = async (courseEndDateId: string) => {
  const records = await find({ limit: { page: 1, take: 100 }, order: { by: 'class_date', dir: 'asc' } }, {
    end_date_id: courseEndDateId,
    exam_id: null,
    book_chapter_id: null,
  })

  return collectionToJson(records.data)
}

export const findDaysByDateRange = async (endDateId: string, dateStart: string, dateEnd: string) => {
  const records = await MODEL
    .where('end_date_id', endDateId)
    .query(qb => {
      qb.whereBetween('class_date', [dateStart, dateEnd])
      qb.orderBy('class_date', 'asc')
    })
    .fetchAll({
      withRelated: ['tutor'],
    })

  return collectionToJson(records)
}
