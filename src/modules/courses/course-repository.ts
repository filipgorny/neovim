import * as R from 'ramda'
import CourseDTO from './dto/book-course-dto'
import orm, { Course } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOneWithoutDeleted,
  _findOneOrFailWithoutDeleted,
  DELETED_AT,
  _patchAll,
  _findOne
} from '../../../utils/generics/repository'
import { notFoundException, throwException } from '@desmart/js-utils'

const MODEL = Course
const MODEL_NAME = 'Course'

const { knex } = orm.bookshelf

export const create = async (dto: CourseDTO) => (
  _create(MODEL)({
    ...dto,
    created_at: new Date(),
  })
)

export const update = async (id: string, dto: CourseDTO) => (
  _patch(MODEL)(id, dto)
)

export const patch = async (id: string, dto: {}) => (
  _patch(MODEL)(id, dto)
)

export const findOne = async (where: object) => (
  _findOne(MODEL)(where)
)

export const findOneWithoutDeleted = async (where: object, withRelated: string[] = []) => (
  _findOneWithoutDeleted(MODEL)(where, withRelated)
)

export const findOneOrFail = async (where: object, withRelated: string[] = []) => (
  _findOneOrFailWithoutDeleted(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)({
    ...where,
    [DELETED_AT]: null,
  }, withRelated, query)
)

export const remove = async (id: string, title: string) => {
  const now = new Date()

  return _patch(MODEL)(id, {
    title,
    deleted_at: now,
  })
}

export const findOneOrFailByExternalId = async (external_id: string) => {
  const results = await knex.from('courses')
    .whereRaw('check_external_id(?, external_id)', [external_id])
    .whereNull('deleted_at')

  const record = R.head(results)

  if (!record) {
    throwException(notFoundException(MODEL_NAME))
  }

  return record
}

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const findAttachedToAdmin = (admin_id: string) => async (query: any, _where: {}, _withRelated = []) => {
  const results = await knex.from('courses')
    .leftJoin('admin_courses', 'courses.id', 'admin_courses.course_id')
    .where('admin_courses.admin_id', admin_id)
    .orderBy(query?.order?.by || 'title', query?.order?.dir || 'asc')
    .offset(query.limit.take * (query.limit.page - 1))
    .limit(query.limit.take)

  return {
    data: results,
    meta: {
      total: results.length,
    },
  }
}
