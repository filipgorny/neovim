import orm, { ContentQuestionReaction } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { ContentQuestionReactionTypeEnum } from './content-question-reaction-types'
import { ContentQuestionReaction as ContentQuestionReactionType } from '../../types/content-question-reaction'

const { knex } = orm.bookshelf

const MODEL = ContentQuestionReaction
const MODEL_NAME = 'ContentQuestionReaction'

export const create = async (dto: {}) => (
  _create(MODEL)({
    ...dto,
    created_at: new Date(),
  })
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object): Promise<ContentQuestionReactionType> => (
  _findOneOrFail(MODEL, MODEL_NAME)(where)
)

export const find = async (query: { limit: number, order: {} }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findReactions = async (query, filter) => {
  const { search, ...where } = filter || {}
  const qb = search ? MODEL.whereRaw('(name ilike \'%\' || ? || \'%\')', [search]) : MODEL

  return findCustom(
    where ? qb.where(where) : qb
  )(query.limit, query.order)
}

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object) => (
  _patch(MODEL)(id, data)
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const getRandomRecord = async (type: ContentQuestionReactionTypeEnum) => {
  const results = await knex.from('content_question_reactions')
    .select('*')
    .whereRaw(knex.raw(`
      type = '${type}' offset floor(random() * (select count(*) from content_question_reactions where type = '${type}'))
    `))
    .limit(1)

  return results.shift()
}
