import orm, { ExamErrata } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'

const { knex } = orm.bookshelf

const MODEL = ExamErrata
const MODEL_NAME = 'ExamErrata'

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

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const fetchAllStudentExamErratas = async (student_id: string, take: number, page: number) => {
  return knex
    .select(
      knex.raw('distinct (ee.*)'),
      'se.title as exam_title'
    )
    .from({ ee: 'exam_erratas' })
    .leftJoin({ se: 'student_exams' }, 'se.exam_id', 'ee.exam_id')
    .where('se.student_id', student_id)
    .andWhereRaw('ee.created_at between se.created_at and now()')
    .orderBy('ee.created_at', 'desc')
    .limit(take)
    .offset(take * (page - 1))
}

export const fetchAllExamErratas = (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }) => (
  knex.from({ ee: 'exam_erratas' })
    .select(
      'ee.*',
      'e.title as exam_title'
    )
    .leftJoin({ e: 'exams' }, 'e.id', 'ee.exam_id')
    .orderBy(order.by, order.dir)
    .limit(limit.take)
    .offset(limit.take * (limit.page - 1))
)
