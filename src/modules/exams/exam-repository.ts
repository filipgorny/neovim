import * as R from 'ramda'
import { Exam } from '../../models'
import ExamDTO from './dto/exam-dto'
import { fetch, fetchCustom, fetchRaw } from '../../../utils/model/fetch'
import { _create, _findOneOrFailWithoutDeleted, _patch, _findOne, DELETED_AT, _findOneOrFail } from '../../../utils/generics/repository'

const MODEL = Exam
const MODEL_NAME = 'Exam'

export const create = async (dto: ExamDTO) => (
  _create(MODEL)(dto)
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const find = async (query: { limit: {}, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)({
    ...where,
    [DELETED_AT]: null,
  }, withRelated, query)
)

export const findOneOrFail = async (where: object, withRelated: string[] = []) => (
  _findOneOrFailWithoutDeleted(MODEL, MODEL_NAME)(where, withRelated)
)

export const findOneOrFailWithDeleted = async (where: object, withRelated: string[] = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const findExamByExternalId = async (external_id: string) => (
  findOneOrFail({ external_id })
)

export const findOne = async (where: object, withRelated?: string[]) => (
  _findOne(MODEL)(where, withRelated)
)

export const findExamForSync = async (examId: string): Promise<any> => {
  const exam = await find({
    limit: {},
    order: {},
  }, { external_id: examId }, ['sections.passages.questions'])

  return R.pipe(
    R.prop('data'),
    R.invoker(0, 'toJSON'),
    R.head
  )(exam)
}

const countResults = async (knex, search) => (
  knex
    .select(
      'e.id',
      'et.*'
    ).from('exams AS e')
    .leftJoin('exam_types AS et', 'et.id', 'e.exam_type_id')
    .whereRaw(`(
      e.title ilike '%' || ? || '%' 
      or et.type ilike '%' || ? || '%'
    )`, [search, search])
    .whereRaw('e.deleted_at is null')
    .groupByRaw('e.id, et.id')
    .countDistinct('e.id')
)

const buildQueryForExamFetch = knex => (
  knex
    .select(
      'e.*',
      'et.title as type_title',
      'et.type as type_type',
      'et.subtype as type_subtype',
      knex.raw(`
  (
    select json_agg(row_to_json(sections)) from (
      select *
      from exam_sections es
        where es.exam_id = e.id
    ) as sections
  ) as sections
      `),
      knex.raw(`
        (
          select count (*)::integer
          from exam_erratas
          where exam_id = e.id
        ) as errata_amount
      `)
    ).from('exams AS e')
    .leftJoin('exam_types AS et', 'et.id', 'e.exam_type_id')
    .whereRaw('e.deleted_at is null')
)

const buildQuery = (filter, search) => async (knex, pagination, order = { by: 'e.created_at', dir: 'desc' }, count = false) => {
  const qb = buildQueryForExamFetch(knex)
    .whereRaw(`(
      e.title ilike '%' || ? || '%' 
      or et.type ilike '%' || ? || '%'
    )`, [search, search])
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))
    .orderByRaw(`${order.by} ${order.dir} NULLS LAST`)

  if (count) {
    const count = await countResults(knex, search)

    const summed = R.pipe(
      R.pluck('count'),
      R.sum,
      R.objOf('count')
    )(count)

    return [summed]
  }

  return qb
}

export const findExams = async (query, filter) => {
  const search = R.propOr('', 'search')(filter)

  return fetchRaw(
    MODEL,
    buildQuery(filter, search)
  )(query)
}

export const findExamsByType = async (type: string) => (
  fetchRaw(
    MODEL,
    knex => buildQueryForExamFetch(knex)
      .whereRaw(`(
        et.type ilike ?
      )`, type)
  )()
)

export const findExamsWithIds = async (column: string, values: string[]) => (
  MODEL.whereIn(column, values)
    .where(DELETED_AT, null)
    .fetchAll()
)

export const findExamsWhereIn = async (columnName: string, values: unknown[], type: string) => (
  fetchRaw(
    MODEL,
    knex => buildQueryForExamFetch(knex)
      .whereIn(columnName, values)
      .whereRaw(`(
        et.type ilike ?
      )`, type)
  )()
)

export const findExamsByIds = async (ids: string) => (
  fetchRaw(
    MODEL,
    knex => buildQueryForExamFetch(knex)
      .whereIn('e.id', ids)
  )()
)
