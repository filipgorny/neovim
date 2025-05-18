import orm, { SaltyBucksDailyLog } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import moment from 'moment'
import { DATE_FORMAT_YMD, PREVIEW_STUDENT_EMAIL } from '../../constants'

const { knex } = orm.bookshelf

const MODEL = SaltyBucksDailyLog
const MODEL_NAME = 'SaltyBucksDailyLog'

export const create = async (dto: {}) => (
  _create(MODEL)({
    ...dto,
    created_at: new Date(),
  })
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

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

const today = () => moment().format(DATE_FORMAT_YMD)

const countActiveProducts = (tableName: string) => (
  knex({ tbl: tableName })
    .select(knex.raw('coalesce(count(tbl.id), 0)::integer'))
    .whereRaw('tbl.student_id = s.id')
    .andWhereRaw('tbl.accessible_to > NOW()')
)

export const findLeaderBoard = async (query: {order: {by: string}}) => (
  knex({ sbdl: 'salty_bucks_daily_log' })
    .select([
      'sbdl.*',
      's.username',
      knex.raw(`(${countActiveProducts('student_exams').toQuery()}) + (${countActiveProducts('student_courses').toQuery()}) as active_products`),
    ])
    .leftJoin({ s: 'students' }, 'sbdl.student_id', 's.id')
    .where({ 'sbdl.created_at': today() })
    .andWhereNot('email', PREVIEW_STUDENT_EMAIL)
    .orderByRaw(`${query.order.by} desc NULLS LAST`)
    .limit(100)
)
