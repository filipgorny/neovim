import * as R from 'ramda'
import orm, { VideoCategory } from '../../models'
import { fetch, fetchCustom, fetchRaw } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import VideoCategoryDTO from './dto/video-category-dto'
import applyFilters from '../../../utils/query/apply-filters'
import allowedFilters from './query/allowed-filters'

const { knex } = orm.bookshelf

const MODEL = VideoCategory
const MODEL_NAME = 'VideoCategory'

export const create = async (dto: VideoCategoryDTO, trx?) => (
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

const fromVideoCategories = (knex, search, filter) => {
  let qb = knex
    .from({ vc: 'video_categories' })
    .leftJoin({ c: 'courses' }, 'vc.course_id', 'c.id')
    .leftJoin({ ced: 'course_end_dates' }, 'vc.end_date_id', 'ced.id')

  applyFilters(allowedFilters)(qb, knex, filter)

  if (search) {
    qb = qb.whereRaw("vc.title ilike '%' || ? || '%'", [search])
  }

  return qb
}

const buildQuery = (filter, search: string) => async (knex, pagination, order, count = false) => {
  const qb = fromVideoCategories(knex, search, filter)
    .select(
      'vc.*',
      'c.title as course_title',
      'c.external_id as course_external_id',
      'ced.end_date'
    )
    .orderBy(order.by, order.dir)
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))

  if (count) {
    return fromVideoCategories(knex, search, filter).count('vc.id')
  }

  return qb
}

export const findVideoCategories = async (query, filter) => {
  const search = R.propOr('', 'search')(filter)

  return fetchRaw(
    MODEL,
    buildQuery(filter, search)
  )(query)
}
