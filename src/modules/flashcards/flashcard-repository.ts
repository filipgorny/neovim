import orm, { BookContentFlashcard } from '../../models'
import { fetch, fetchCustom, fetchRaw } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _findOneInstanceOrFailWithoutDeleted,
  DELETED_AT,
  _delete
} from '../../../utils/generics/repository'
import R from 'ramda'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import applyFilters from '../../../utils/query/apply-filters'
import allowedFilters from './query/allowed-filters'

const { knex } = orm.bookshelf

const MODEL = BookContentFlashcard
const MODEL_NAME = 'BookContentFlashcard'

export const create = async (dto: {}) => (
  _create(MODEL)({
    ...dto,
    created_at: new Date(),
  })
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRealted = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRealted)

)

export const findOneInstanceOrFail = async (where: object, withRealted = []) => (
  _findOneInstanceOrFailWithoutDeleted(MODEL, MODEL_NAME)(where, withRealted)
)

export const find = async (query: { limit: {take: number, page: number}, order: {by: string, dir: 'asc' | 'desc'} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const remove = async (id: string) => {
  const now = new Date()

  return patch(id, {
    [DELETED_AT]: now,
  })
}

export const deleteCompletely = async (id: string) => (
  _delete(MODEL)({ id })
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = [], disablePagination = false) => (
  fetchCustom(qb)(withRelated, { limit, order }, disablePagination)
)

export const findFlashcardsWithIds = async (ids: string[]) => R.pipeWith(R.andThen)([
  async () => findCustom(MODEL.whereIn('id', ids))(undefined, undefined, [], true),
  R.prop('data'),
  collectionToJson,
])(true)

const fromBookFlashcards = (knex, search, filter) => {
  let qb = knex.select('f.id as flashcard_id').from('flashcards_list_view as f')
    .leftJoin('book_content_flashcards as bcf', 'bcf.flashcard_id', 'f.id')
    .leftJoin('book_contents as bc', 'bcf.content_id', 'bc.id')
    .leftJoin('book_subchapters as bs', 'bc.subchapter_id', 'bs.id')
    .leftJoin('book_chapters as bcc', 'bs.chapter_id', 'bcc.id')
    .leftJoin('books as b', 'bcc.book_id', 'b.id')

  applyFilters(allowedFilters)(qb, knex, filter)

  if (search) {
    search.trim().split(/\s+/).forEach((word, idx, arr) => {
      if (idx === 0) {
        qb = qb.whereRaw(`(
          f.raw_question ilike '%' || ? || '%'
          or f.raw_explanation ilike '%' || ? || '%' 
        )`, [word, word])
      } else {
        qb = qb.andWhereRaw(`(
          f.raw_question ilike '%' || ? || '%'
          or f.raw_explanation ilike '%' || ? || '%' 
        )`, [word, word])
      }
    })
  }
  return qb
}

const countResults = async (knex, search, filter) => (
  fromBookFlashcards(knex, search, filter)
    .select(
      'f.id'
    )
    .whereRaw('f.is_archived = false')
    .groupByRaw('f.id')
    .countDistinct('f.id')
)

const buildQuery = (filter, search) => async (knex, pagination, order, count = false) => {
  let qb = fromBookFlashcards(knex, search, filter)
    .select(
      'f.id',
      'f.question',
      'f.question_image',
      'f.explanation',
      'f.explanation_image',
      'f.created_at',
      'f.code',
      'f.question_html',
      'f.explanation_html',
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
            left join book_content_flashcards bocf on bocf.content_id = boc.id 
          where bocf.flashcard_id = f.id
            and bos.deleted_at is null
            and boc.deleted_at is null
            and bo.is_archived is false
        ) as tags
      ) as tags
    `)
    )
    .whereRaw('f.is_archived = false')
    .distinctOn(['f.id'])

  qb = knex
    .select('*')
    .from({ qb })
    .orderByRaw('qb.code, qb.id')
    .limit(pagination.take)
    .offset(pagination.take * (pagination.page - 1))

  if (count) {
    const count = await countResults(knex, search, filter)

    const summed = R.pipe(
      R.pluck('count'),
      R.sum,
      R.objOf('count')
    )(count)

    return [summed]
  }

  return qb
}

export const findFlashcards = async (query, filter) => {
  const search = R.propOr('', 'search')(filter)

  return fetchRaw(
    MODEL,
    buildQuery(filter, search)
  )(query)
}

const maxCodeQuery = async (knex, pagination, order, count = false) => {
  return knex.raw(`
    select max(code)
    from flashcards
  `)
}

export const getMaxCode = async () => (
  R.pipeWith(R.andThen)([
    async () => fetchRaw(MODEL, maxCodeQuery)(),
    R.prop('data'),
    R.prop('rows'),
    R.head,
    R.prop('max'),
    max => +max,
  ])(true)
)

export const unarchiveFlashcard = async (id: string) => (
  patch(id, { is_archived: false })
)

export const archiveFlashcard = async (id: string) => (
  patch(id, { is_archived: true })
)

export const setFlashcardCode = async (id: string, code: number) => (
  patch(id, { code })
)
