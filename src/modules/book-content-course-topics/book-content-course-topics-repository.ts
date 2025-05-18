import orm, { BookContentCourseTopic } from '../../models'
import { fetch, fetchCustom } from '../../../utils/model/fetch'
import {
  _patch,
  _create,
  _findOne,
  _findOneOrFail,
  _delete
} from '../../../utils/generics/repository'

const { knex } = orm.bookshelf

const MODEL = BookContentCourseTopic
const MODEL_NAME = 'BookContentCourseTopic'

export const create = async (dto: {}, trx?) => (
  _create(MODEL)(dto, trx)
)

export const findOne = async (where: {}) => (
  _findOne(MODEL)(where)
)

export const findOneOrFail = async (where: object, withRelated = []) => (
  _findOneOrFail(MODEL, MODEL_NAME)(where, withRelated)
)

export const find = async (query: { limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' } }, where = {}, withRelated = []) => (
  fetch(MODEL)(where, withRelated, query)
)

export const findByContentId = async (content_id: string) => (
  knex
    .from('book_content_course_topics')
    .where('book_content_id', content_id)
)

export const findByCourseTopicAndCourse = async (course_topic_id: string, course_id: string) => (
  knex
    .from('book_content_course_topics')
    .where({ course_id, course_topic_id })
)

export const findCustom = (qb: any) => async (limit: { page: number, take: number }, order: { by: string, dir: 'asc' | 'desc' }, withRelated = []) => (
  fetchCustom(qb)(withRelated, { limit, order })
)

export const patch = async (id: string, data: object, trx?) => (
  _patch(MODEL)(id, data, trx)
)

export const markAsNonArtificial = async (id: string) => (
  patch(id, { is_artificial: false })
)

export const deleteRecord = async (id: string) => (
  _delete(MODEL)({ id })
)

export const deleteWhere = async (where: {}) => (
  _delete(MODEL)(where)
)

export const findForCourse = async (course_id: string) => (
  knex
    .select('bcct.*')
    .from({ bcct: 'book_content_course_topics' })
    .leftJoin({ cb: 'course_books' }, 'bcct.book_id', 'cb.book_id')
    .whereRaw(knex.raw('bcct.course_id = ? and bcct.course_id = cb.course_id', [course_id]))
    .orderBy('id', 'asc')
)
