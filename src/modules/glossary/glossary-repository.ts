import orm, { Glossary, BookScanListView } from '../../models'
import { fetch, fetchCustom, fetchRaw } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { GlossaryRecord } from '../../types/glossary-record'
import GlossaryRecordDTO from './dto/glossary-record-dto'
import R from 'ramda'
import { notFoundException, throwException } from '../../../utils/error/error-factory'
import { customException, int } from '@desmart/js-utils'

const { knex } = orm.bookshelf

const MODEL = Glossary
const MODEL_NAME = 'Glossary'

export const create = async (dto: GlossaryRecordDTO): Promise<GlossaryRecord> => (
  _create(MODEL)(dto)
)

export const update = async (id: string, dto: GlossaryRecordDTO): Promise<GlossaryRecord> => (
  _patch(MODEL)(id, dto)
)

export const patch = async (id: string, dto: {}): Promise<GlossaryRecord> => (
  _patch(MODEL)(id, dto)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const findOne = async (where: object) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)({
    ...where,
  }, withRelated, query)
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const findOneByPhrase = async (phrase_raw: string) => {
  const qb = MODEL.whereRaw('(lower(phrase_raw) = lower(?))', phrase_raw)

  return findCustom(qb)({ page: 1, take: 1 }, { by: 'phrase_raw', dir: 'asc' })
}

export const findOneByPhraseExcludeId = (id: string) => async (phrase_raw: string) => {
  const qb = MODEL.whereRaw('(lower(phrase_raw) = lower(?) and id != ?)', [phrase_raw, id])

  return findCustom(qb)({ page: 1, take: 1 }, { by: 'phrase_raw', dir: 'asc' })
}

export const findGlossaryRecords = async (query, filter) => {
  const { search, ...where } = filter || {}
  const qb = search ? MODEL.whereRaw('(phrase_raw ilike (\'%\' || ? || \'%\') or explanation_raw ilike (\'%\' || ? || \'%\'))', [search, search]) : MODEL

  return findCustom(
    where ? qb.where(where) : qb
  )(query.limit, query.order)
}

export const findGlossaryRecordsWithPhrasesFirst = async (query, filter) => {
  const { search, ...where } = filter || {}
  let qb

  if (!search) {
    qb = knex.from('glossary')
      .where(where)
      .orderByRaw(`"${query.order.by}" collate "en_US" ${query.order.dir}`)
  } else {
    const qbPhrases = knex.from('glossary')
      .whereRaw('(phrase_raw ilike (\'%\' || ? || \'%\'))', [search])
      .where(where)
      .orderByRaw(`"${query.order.by}" collate "en_US" ${query.order.dir}`)
    const qbExplanations = knex.from('glossary')
      .whereRaw('(explanation_raw ilike (\'%\' || ? || \'%\'))', [search])
      .where(where)
      .whereRaw(`(id not in (${qbPhrases.clone().select('id').toSQL().sql}))`, qbPhrases.clone().toSQL().bindings)
      .orderByRaw(`"${query.order.by}" collate "en_US" ${query.order.dir}`)

    qb = knex
      .unionAll(knex.raw(`(${qbPhrases.toSQL().sql})`, qbPhrases.toSQL().bindings))
      .unionAll(knex.raw(`(${qbExplanations.toSQL().sql})`, qbExplanations.toSQL().bindings))
  }

  const qbClone = qb.clone()

  const results = await qb
    .limit(query.limit.take)
    .offset(query.limit.take * (query.limit.page - 1))

  const recordsTotal = await R.pipeWith(R.andThen)([
    async () => knex.raw(`select count(*) from (${qbClone.toSQL().sql}) t`, qbClone.toSQL().bindings),
    R.prop('rows'),
    R.head,
    R.values,
    R.head,
    int,
  ])(true)

  return {
    data: results,
    meta: {
      recordsTotal,
      pagesTotal: Math.ceil(recordsTotal / query.limit.take),
      page: int(query.limit.page),
      take: int(query.limit.take),
    },
  }
}

const removeDuplicates = R.pipe(
  R.groupBy(R.prop('id')),
  R.values,
  R.map(R.head)
)

export const findGlossaryRecordsForStudent = async (query, filter) => {
  const { search, ...where } = filter || {}
  let results

  if (search) {
    const binding = knex.raw(search.replace(/'/g, ''))

    results = await knex.raw(
      'select *, 1 as importance from glossary g where phrase_raw ilike \'?\' ' +
      'union ' +
      'select *, 2 as importance from glossary g where phrase_raw ilike \'?%\' ' +
      'union ' +
      'select *, 3 as importance from glossary g where phrase_raw ilike \'%?%\' ' +
      'order by importance asc, phrase_raw asc limit ' + query.limit.take + ' offset ' + (query.limit.take * (query.limit.page - 1)), [binding, binding, binding])
  } else {
    results = await knex.raw(
      'select * from glossary g ' +
      'limit ' + query.limit.take + ' offset ' + (query.limit.take * (query.limit.page - 1)))
  }

  return {
    data: removeDuplicates(results.rows),
  }
}

export const scanBooksForGlossary = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, search: string, glossary_id: string) => (
  findCustom(
    BookScanListView
      .whereRaw('(raw ilike (\'%\' || ? || \'%\') and delta_object not ilike (\'%\' || ? || \'%\'))', [search, glossary_id])
  )(query.limit, query.order)
)

export const scanContentForGlossary = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, words: string[], skipIds: string[]) => (
  findCustom(
    MODEL
      .whereRaw('(to_tsvector(\'english\', phrase_raw) @@ to_tsquery(\'english\',  ?))', words.join(' | '))
      .whereNotIn('id', skipIds)
  )(query.limit, query.order)
)

const fromGlossary = (knex, search?, filter?) => (
  knex.from('glossary as g')
)

const countResults = async (knex, search?, filter?) => (
  fromGlossary(knex, search, filter)
    .select(
      'id'
    )
    .groupByRaw('id')
    .countDistinct('id')
)

const buildQuery = (id) => async (knex, pagination, order, count = false) => {
  const qb = fromGlossary(knex)
    .select(
      'g.*',
      knex.raw(`
      (
        select json_agg(row_to_json(occurances)) from (
          select * 
          from book_scan_list_view
            where delta_object ilike ('%' || ? || '%')
        ) as occurances
      ) as occurances
    `, id)
    )
    .where({ id })
    .limit(1)
    .offset(0)

  if (count) {
    const count = await countResults(knex)

    const summed = R.pipe(
      R.pluck('count'),
      R.sum,
      R.objOf('count')
    )(count)

    return [summed]
  }

  return qb
}

export const findOneGlossaryWithOccurances = async id => R.pipeWith(R.andThen)([
  async () => fetchRaw(
    MODEL,
    buildQuery(id)
  )({ limit: undefined, order: undefined }),
  R.prop('data'),
  R.when(
    R.isEmpty,
    () => throwException(notFoundException(MODEL_NAME))
  ),
  R.head,
])(true)

const detachGlossaryFrom = (tableName, id) => (
  knex.raw(`UPDATE ${tableName} set delta_object = regexp_replace(
    delta_object, ',\\?"glossary":"' || ? || '"', '', 'g'
  ) where delta_object ilike '%' || ? || '%'`, [id, id])
)

export const detachGlossaryFromBookContents = async (id: string): Promise<void> => (
  detachGlossaryFrom('book_contents', id)
)

export const detachGlossaryFromBookContentResources = async (id: string): Promise<void> => (
  detachGlossaryFrom('book_content_resources', id)
)
