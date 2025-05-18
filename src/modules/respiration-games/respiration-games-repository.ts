import orm, { RespirationGame } from '../../models'
import { buildMeta, fetch, fetchCustom, paginate } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { notFoundException, throwException } from '@desmart/js-utils'
import { getStudentRank } from '../../../services/games/helpers/games-repository'

const { knex } = orm.bookshelf

const MODEL = RespirationGame
const MODEL_NAME = 'RespirationGame'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)({
    ...dto,
    created_at: new Date(),
  }, trx)
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

export const findPersonalBestResults = async (student_id: string, bloxGameEnabled: boolean, difficulty?: string, {
  limit,
  order,
} = {
  limit: {
    take: 10,
    page: 1,
  },
  order: {
    by: 'score',
    dir: 'desc',
  },
}) => {
  try {
    const [{ count: recordsTotal }] = await knex({ rg: 'respiration_games' })
      .where('student_id', student_id)
      .andWhere('blox_game_enabled', bloxGameEnabled)
      .andWhereRaw('(is_paused = false and (?::text is null or difficulty = ?))', [difficulty ?? null, difficulty ?? null])
      .count()
    const instances = await knex({ rg: 'respiration_games' })
      .select(knex.raw('rg.*, s.username'))
      .leftJoin('students as s', 's.id', 'rg.student_id')
      .where('student_id', student_id)
      .andWhere('blox_game_enabled', bloxGameEnabled)
      .andWhereRaw('(is_paused = false and (?::text is null or difficulty = ?))', [difficulty ?? null, difficulty ?? null])
      .orderBy(order.by, order.dir)
      .offset(limit.take * (limit.page - 1))
      .limit(limit.take)

    return {
      data: instances,
      meta: buildMeta(
        paginate(limit)
      )(recordsTotal),
    }
  } catch (e) {
    console.log(e)
    throwException(notFoundException(MODEL_NAME))
  }
}

export const findPeriodResults = async (beginDate: string, endDate: string, bloxGameEnabled: boolean, isJustDate: boolean = false, difficulty?: string, {
  limit,
  order,
} = {
  limit: {
    take: 10,
    page: 1,
  },
  order: {
    by: 'score',
    dir: 'desc',
  },
}) => {
  try {
    const recordsTotal = await MODEL
      .where('created_at', '>=', beginDate)
      .andWhere('created_at', '<', isJustDate ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000) : endDate)
      .andWhere('blox_game_enabled', bloxGameEnabled)
      .andWhereRaw('(is_paused = false and (?::text is null or difficulty = ?))', [difficulty ?? null, difficulty ?? null])
      .count()
    const instances = await knex({ rg: 'respiration_games' })
      .select(knex.raw('rg.*, s.username'))
      .leftJoin('students as s', 's.id', 'rg.student_id')
      .where('rg.created_at', '>=', beginDate)
      .andWhere('rg.created_at', '<', isJustDate ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000) : endDate)
      .andWhere('blox_game_enabled', bloxGameEnabled)
      .andWhereRaw('(is_paused = false and (?::text is null or difficulty = ?))', [difficulty ?? null, difficulty ?? null])
      .orderBy(order.by, order.dir)
      .offset(limit.take * (limit.page - 1))
      .limit(limit.take)

    return {
      data: instances,
      meta: buildMeta(
        paginate(limit)
      )(recordsTotal),
    }
  } catch (e) {
    console.log(e)
    throwException(notFoundException(MODEL_NAME))
  }
}

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const getRespirationStudentRank = getStudentRank('respiration_games')
