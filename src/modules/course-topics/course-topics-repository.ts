import * as R from 'ramda'
import orm, { CourseTopic } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'
import { fixOrderAfterDeleting } from '@desmart/js-utils'
import { collectionToJson } from '../../../utils/model/collection-to-json'

const { knex } = orm.bookshelf

const MODEL = CourseTopic
const MODEL_NAME = 'CourseTopic'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)(dto, trx)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: { take: number, page: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
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

export const deleteWhere = async (where: {}) => (
  _delete(MODEL)(where)
)

export const getNextOrderByCourseId = async (course_id: string): Promise<number> => {
  const records = await find({ limit: { take: 5000, page: 1 }, order: { by: 'order', dir: 'asc' } }, { course_id })

  return R.pipe(
    R.prop('data'),
    R.length,
    R.inc
  )(records)
}

export const fixBookContentOrderAfterDeleting = async (course_id: string, order: number): Promise<void> => (
  fixOrderAfterDeleting(knex, 'course_topics', 'course_id')(course_id, order)
)

export const findCourseTopics = async (query, filter, withRelated = []) => {
  const { search, ...where } = filter || {}

  const qb = search
    ? MODEL.whereRaw(`(
      topic ilike '%' || ? || '%' 
    )`, [search])
    : MODEL

  return findCustom(
    where ? qb.where(where) : qb
  )(query.limit, query.order, withRelated)
}

export const incrementOrdersGreaterThanGivenOrder = async (course_id: string, order: number) => (
  knex.raw(`
    UPDATE course_topics
    SET "order" = "order" + 1
    WHERE 
      "order" > ?
      AND course_id = ?;
  `,
  [order, course_id])
)

export const findParentOfCourseTopic = async (id: string) => (
  R.pipeWith(R.andThen)([
    async (id: string) => findOneOrFail({ id }),
    async courseTopic => knex
      .from('course_topics')
      .select('*')
      .whereRaw(knex.raw('level < ? and course_id = ? and "order" < ?', [courseTopic.level, courseTopic.course_id, courseTopic.order]))
      .orderBy('order', 'desc')
      .limit(1),
    R.head,
  ])(id)
)

export const findNextCourseTopicWithLTELevel = async (id: string) => (
  R.pipeWith(R.andThen)([
    async (id: string) => findOneOrFail({ id }),
    async courseTopic => knex
      .from('course_topics')
      .select('*')
      .whereRaw(knex.raw('level <= ? and course_id = ? and "order" > ?', [courseTopic.level, courseTopic.course_id, courseTopic.order]))
      .orderBy('order', 'asc')
      .limit(1),
    R.head,
  ])(id)
)

export const findAllChildrenOfCourseTopic = async (id: string) => (
  R.pipeWith(R.andThen)([
    findNextCourseTopicWithLTELevel,
    async courseTopic => {
      const parentCourseTopic = await findOneOrFail({ id })

      if (courseTopic) {
        return knex
          .from('course_topics')
          .select('*')
          .whereRaw(knex.raw('course_id = ? and "order" < ? and "order" > ?', [courseTopic.course_id, courseTopic.order, parentCourseTopic.order]))
          .orderBy('order', 'asc')
      } else {
        return knex
          .from('course_topics')
          .select('*')
          .whereRaw(knex.raw('course_id = ? and "order" > ?', [parentCourseTopic.course_id, parentCourseTopic.order]))
          .orderBy('order', 'asc')
      }
    },
  ])(id)
)
