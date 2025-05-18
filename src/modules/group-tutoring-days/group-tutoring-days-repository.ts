import { GroupTutoringDay } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import moment from 'moment'
import { collectionToJson } from '../../../utils/model/collection-to-json'

const MODEL = GroupTutoringDay
const MODEL_NAME = 'GroupTutoringDay'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)(dto, trx)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
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

export const findFutureGroupTutoringDays = (course_id: string, n_days: number) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(
    MODEL
      .where('class_date', '>=', moment().startOf('day').subtract(1, 'days'))
      .where('course_id', course_id)
      .where('class_date', '<', moment().startOf('day').add(n_days, 'days'))
  )(withRelated, { limit, order })
)

export const findDaysByDateRange = async (courseId: string, dateStart: string, dateEnd: string) => {
  const records = await MODEL
    .where('course_id', courseId)
    .query(qb => {
      qb.whereBetween('class_date', [dateStart, dateEnd])
      qb.orderBy('class_date', 'asc')
    })
    .fetchAll({
      withRelated: ['tutor'],
    })

  return collectionToJson(records)
}

export const findFutureDays = async (courseId: string) => {
  const records = await MODEL
    .where('course_id', courseId)
    .where('class_date', '>=', moment().startOf('day').subtract(1, 'days').format('YYYY-MM-DD'))
    .query(qb => {
      qb.orderBy(['class_date', 'class_time'])
    })
    .fetchAll({
      withRelated: ['tutor'],
    })

  return collectionToJson(records)
}
