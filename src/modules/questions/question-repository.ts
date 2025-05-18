import orm, { Question } from '../../models'
import QuestionDto from './dto/question-dto'
import { _create, _findOne, _patch, DELETED_AT, _findOneOrFail, _delete } from '../../../utils/generics/repository'
import R from 'ramda'
import { fetchCustom, fetchRaw, Order, Pagination } from '../../../utils/model/fetch'
import { Knex } from 'knex'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import applyFilters from '../../../utils/query/apply-filters'
import allowedFilters from './query/allowed-filters'

const { knex } = orm.bookshelf

const MODEL = Question
const MODEL_NAME = 'Question'

export const create = async (dto: QuestionDto) => (
  _create(MODEL)(dto)
)

export const update = async (id: string, dto: QuestionDto) => (
  _patch(MODEL)(id, dto)
)

export const patch = async (id: string, data: {}) => (
  _patch(MODEL)(id, data)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const findOne = async (where: object, withRelated = []) => (
  _findOne(MODEL)(where, withRelated)
)

export const updateActiveQuestionById = async (command: { id: string, data: any }, trx?) => {
  let qb = knex('questions')
    .where({ id: command.id, [DELETED_AT]: null })
    .update({ ...command.data, updated_at: new Date() }, '*')

  if (trx) {
    qb = qb.transacting(trx)
  }

  const result = await qb

  return R.head(result)
}

export const deleteCompletely = async (id: string) => (
  _delete(MODEL)({ id })
)

export const softDeleteActiveQuestionById = async (command: { id: string}, trx?) => {
  return updateActiveQuestionById({ id: command.id, data: { [DELETED_AT]: knex.fn.now() } }, trx)
}

export const findActiveById = async (command: { id: string }) => _findOne(MODEL)({ id: command.id, [DELETED_AT]: null })

const fetchQuestionsQuery = query => async (knex, pagination: Pagination, order: Order, count: boolean) => {
  const q = knex
    .select(
      knex.raw(`
      (case
        when bcq.id is not null then ROW_NUMBER() over (partition by b.id order by bcc.order, bs.order, bcq.subchapter_order)
        else 0
      end) as number
      `),
      'q.*'
    )
    .from({ q: 'questions' })
    .leftJoin({ bcq: 'book_content_questions' }, 'q.id', 'bcq.question_id')
    .leftJoin({ bc: 'book_contents' }, 'bc.id', 'bcq.content_id')
    .leftJoin({ bs: 'book_subchapters' }, 'bs.id', 'bc.subchapter_id')
    .leftJoin({ bcc: 'book_chapters' }, 'bcc.id', 'bs.chapter_id')
    .leftJoin({ b: 'books' }, 'b.id', 'bcc.book_id')
    .whereRaw('q.is_archived = false')
    .whereNull(`q.${DELETED_AT}`)

  let qb = knex
    .from({ q })
    .leftJoin({ bcq: 'book_content_questions' }, 'q.id', 'bcq.question_id')
    .leftJoin({ bc: 'book_contents' }, 'bc.id', 'bcq.content_id')
    .leftJoin({ bs: 'book_subchapters' }, 'bs.id', 'bc.subchapter_id')
    .leftJoin({ bcc: 'book_chapters' }, 'bcc.id', 'bs.chapter_id')
    .leftJoin({ b: 'books' }, 'b.id', 'bcc.book_id')
    .whereRaw('q.is_archived = false')
    .whereNull(`q.${DELETED_AT}`)

  let orderClause = ''
  const filter = query.filter || {}
  const { search } = filter

  applyFilters(allowedFilters)(qb, knex, filter)

  if (search) {
    const ilikeFormula = "ilike '%' || ? || '%'"

    qb = qb.andWhereRaw(
      `(q.question_content_raw ${ilikeFormula} or q.explanation_raw ${ilikeFormula})`,
      R.repeat(search, 2)
    )
  }

  if (count) {
    const count = await qb.count('q.id')

    const summed = R.pipe(
      R.pluck('count'),
      R.sum,
      R.objOf('count')
    )(count)

    return [summed]
  }

  if (order?.by) {
    orderClause = `q.${order.by} ${order.dir} NULLS LAST, q.question_content_raw collate "en_US" asc`
  }

  return qb
    .orderByRaw(orderClause || 'q.id asc')
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))
    .select(
      'q.*',
      knex.raw(`
        (
          select json_agg(row_to_json(tags)) from (
            select 
              bo.tag, 
              bo.tag_colour,
              bo.id as book_id,
              bo.title as book_title,
              bo.is_locked as book_is_locked,
              bocc.id as chapter_id,
              bocc."order" as chapter_order,
              bos.part,
              bos.id as subchapter_id,
              bos."order" as subchapter_order,
              bos.title as subchapter_title,
              boc.id as content_id,
              boc."order" as content_order
            from books bo
              left join book_chapters bocc on bocc.book_id = bo.id
              left join book_subchapters bos on bos.chapter_id = bocc.id 
              left join book_contents boc on boc.subchapter_id = bos.id 
              left join book_content_questions bocq on bocq.content_id = boc.id 
            where bocq.question_id = q.id
              and bos.deleted_at is null
              and boc.deleted_at is null
              and bo.is_archived is false
          ) as tags
        )::text as tags
      `)
    )
}

export const findQuestions = async (query: any) => (
  fetchRaw(MODEL, fetchQuestionsQuery(query))(query)
)

export const countActiveByIds = async (command: { ids: string[] }) => {
  const result = await knex('questions')
    .whereIn('id', command.ids)
    .andWhere({ [DELETED_AT]: null })
    .count('id')
    .first()

  return parseInt(result.count as string, 10)
}

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = [], disablePagination = false) => (
  fetchCustom(qb)(withRelated, { limit, order }, disablePagination)
)

export const findQuestionsWithIds = async (ids: string[]) => R.pipeWith(R.andThen)([
  async () => findCustom(MODEL.whereIn('id', ids))(undefined, undefined, [], true),
  R.prop('data'),
  collectionToJson,
])(true)

export const unarchiveQuestion = async (id: string) => (
  patch(id, { is_archived: false })
)

export const archiveQuestion = async (id: string) => (
  patch(id, { is_archived: true })
)
